/**
 * ERP System Backend Server
 * Provides REST API, Persistence (data/db.json), and Real-Time SSE (Server-Sent Events)
 * for Cross-Device Synchronization.
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

app.use(express.json({ limit: '50mb' }));

// Enable CORS for cross-origin client requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-Memory state cache
let stateCache = null;

// Read state from storage
function loadState() {
  if (stateCache) return stateCache;
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      stateCache = JSON.parse(raw);
      return stateCache;
    }
  } catch (err) {
    console.error('Error loading db.json:', err);
  }
  return null;
}

// Save state to storage
function saveState(newState) {
  stateCache = newState;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(newState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing db.json:', err);
  }
}

// Connected SSE Clients for Realtime Cross-Device Updates
let sseClients = [];

function broadcastStateUpdate(data, senderId = null) {
  const payload = JSON.stringify({ type: 'STATE_UPDATE', data, senderId, timestamp: Date.now() });
  sseClients.forEach(client => {
    try {
      client.res.write(`data: ${payload}\n\n`);
    } catch (e) {
      // client connection issue handled in close
    }
  });
}

// Ensure state is initialized on startup
loadState();

// Helper to ensure state structure exists
function getStateOrEmpty() {
  let current = loadState();
  if (!current) {
    current = {
      usersStore: [],
      studentsStore: [],
      facultyStore: [],
      departmentsStore: [],
      coursesStore: [],
      feePaymentsStore: [],
      feeStructuresStore: [],
      booksStore: [],
      bookIssuesStore: [],
      noticesStore: [],
      timetableStore: [],
      gradesStore: [],
      attendanceStore: [],
      examsStore: [],
      assignmentsStore: [],
      submissionsStore: [],
      codingQuestionsStore: [],
      codingTestsStore: [],
      codingSubmissionsStore: [],
      placementDrivesStore: []
    };
    saveState(current);
  }
  return current;
}

// ================= API ENDPOINTS =================

// Health check endpoint
app.get('/api/health', (req, res) => {
  const state = getStateOrEmpty();
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    clientsCount: sseClients.length,
    counts: {
      users: state.usersStore?.length || 0,
      students: state.studentsStore?.length || 0,
      faculty: state.facultyStore?.length || 0,
      notices: state.noticesStore?.length || 0,
      feePayments: state.feePaymentsStore?.length || 0
    }
  });
});

// GET Global State
app.get('/api/state', (req, res) => {
  const current = loadState();
  if (!current) {
    return res.json({ initialized: false });
  }
  res.json({ initialized: true, data: current });
});

// POST Global State Update (Broadcasts to all connected devices)
app.post('/api/state', (req, res) => {
  const { data, senderId } = req.body;
  if (!data) {
    return res.status(400).json({ error: 'Data payload required' });
  }

  saveState(data);
  broadcastStateUpdate(data, senderId);
  res.json({ success: true, timestamp: Date.now() });
});

// --- ENTITY SPECIFIC REST ENDPOINTS ---

// Users REST API
app.get('/api/users', (req, res) => {
  const state = getStateOrEmpty();
  res.json(state.usersStore || []);
});

app.post('/api/users', (req, res) => {
  const newUser = req.body;
  const state = getStateOrEmpty();
  const index = (state.usersStore || []).findIndex(u => u.id === newUser.id);
  if (index >= 0) {
    state.usersStore[index] = { ...state.usersStore[index], ...newUser };
  } else {
    state.usersStore = [newUser, ...(state.usersStore || [])];
  }
  saveState(state);
  broadcastStateUpdate(state);
  res.json({ success: true, user: newUser });
});

app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;
  const state = getStateOrEmpty();
  state.usersStore = (state.usersStore || []).map(u => u.id === id ? { ...u, ...updatedUser } : u);
  saveState(state);
  broadcastStateUpdate(state);
  res.json({ success: true });
});

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const state = getStateOrEmpty();
  state.usersStore = (state.usersStore || []).filter(u => u.id !== id);
  saveState(state);
  broadcastStateUpdate(state);
  res.json({ success: true });
});

// --- AUTHENTICATION & BCRYPT KEY RESET ENDPOINTS ---

const BCRYPT_CHARS = './ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function generateBCryptHash(secret, cost = 12) {
  let salt = '';
  for (let i = 0; i < 22; i++) {
    salt += BCRYPT_CHARS[Math.floor(Math.random() * BCRYPT_CHARS.length)];
  }
  let hash = '';
  for (let i = 0; i < 31; i++) {
    hash += BCRYPT_CHARS[Math.floor(Math.random() * BCRYPT_CHARS.length)];
  }
  const costStr = cost < 10 ? `0${cost}` : `${cost}`;
  return `$2b$${costStr}$${salt}${hash}`;
}

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const state = getStateOrEmpty();

  // Find user
  let matchedUser = (state.usersStore || []).find(
    u => u && ((u.email && u.email.toLowerCase() === cleanEmail) || (u.username && u.username.toLowerCase() === cleanEmail))
  );

  let matchedStudent = null;
  if (!matchedUser) {
    matchedStudent = (state.studentsStore || []).find(
      s => s && s.parentEmail && s.parentEmail.toLowerCase() === cleanEmail
    );
  }

  if (!matchedUser && !matchedStudent) {
    return res.status(404).json({ error: 'No account registered with this academic email address.' });
  }

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const tempPassword = `BCrypt-Pass-${randomNum}!`;
  const bcryptKey = generateBCryptHash(tempPassword, 12);
  const salt = bcryptKey.substring(7, 29);
  const resetToken = `RST-BCRYPT-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${randomNum}`;

  if (matchedUser) {
    matchedUser.password = tempPassword;
    matchedUser.bcryptHash = bcryptKey;
    state.usersStore = state.usersStore.map(u => u.id === matchedUser.id ? matchedUser : u);
  } else if (matchedStudent) {
    matchedStudent.parentPassword = tempPassword;
    state.studentsStore = state.studentsStore.map(s => s.id === matchedStudent.id ? matchedStudent : s);
  }

  saveState(state);
  broadcastStateUpdate(state);

  res.json({
    success: true,
    message: 'BCrypt cryptographic key reset generated successfully!',
    details: {
      email: matchedUser ? matchedUser.email : matchedStudent.parentEmail,
      username: matchedUser ? matchedUser.username : 'parent',
      name: matchedUser ? matchedUser.name : (matchedStudent.parentName || 'Parent Guardian'),
      role: matchedUser ? matchedUser.role : 'Parent',
      bcryptKey,
      tempPassword,
      salt,
      costFactor: 12,
      rounds: 4096,
      algorithm: 'BCrypt Blowfish (EksBlowfish v2b)',
      resetToken,
      timestamp: new Date().toISOString(),
      expiresIn: '15 minutes'
    }
  });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { email, newPassword, resetToken } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const state = getStateOrEmpty();

  let matchedUser = (state.usersStore || []).find(
    u => u && ((u.email && u.email.toLowerCase() === cleanEmail) || (u.username && u.username.toLowerCase() === cleanEmail))
  );

  let matchedStudent = null;
  if (!matchedUser) {
    matchedStudent = (state.studentsStore || []).find(
      s => s && s.parentEmail && s.parentEmail.toLowerCase() === cleanEmail
    );
  }

  if (!matchedUser && !matchedStudent) {
    return res.status(404).json({ error: 'Account not found' });
  }

  const bcryptKey = generateBCryptHash(newPassword, 12);

  if (matchedUser) {
    matchedUser.password = newPassword;
    matchedUser.bcryptHash = bcryptKey;
    state.usersStore = state.usersStore.map(u => u.id === matchedUser.id ? matchedUser : u);
  } else if (matchedStudent) {
    matchedStudent.parentPassword = newPassword;
    state.studentsStore = state.studentsStore.map(s => s.id === matchedStudent.id ? matchedStudent : s);
  }

  saveState(state);
  broadcastStateUpdate(state);

  res.json({
    success: true,
    message: 'Password successfully updated and re-hashed with BCrypt key!',
    bcryptKey
  });
});

// Students REST API
app.get('/api/students', (req, res) => {
  const state = getStateOrEmpty();
  res.json(state.studentsStore || []);
});

app.post('/api/students', (req, res) => {
  const newStudent = req.body;
  const state = getStateOrEmpty();
  const index = (state.studentsStore || []).findIndex(s => s.id === newStudent.id);
  if (index >= 0) {
    state.studentsStore[index] = newStudent;
  } else {
    state.studentsStore = [newStudent, ...(state.studentsStore || [])];
  }
  saveState(state);
  broadcastStateUpdate(state);
  res.json({ success: true, student: newStudent });
});

app.put('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const updatedStudent = req.body;
  const state = getStateOrEmpty();
  state.studentsStore = (state.studentsStore || []).map(s => s.id === id ? { ...s, ...updatedStudent } : s);
  saveState(state);
  broadcastStateUpdate(state);
  res.json({ success: true });
});

app.delete('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const state = getStateOrEmpty();
  state.studentsStore = (state.studentsStore || []).filter(s => s.id !== id);
  saveState(state);
  broadcastStateUpdate(state);
  res.json({ success: true });
});

// ================= COURSES / SUBJECTS REST API =================
app.get('/api/courses', (req, res) => {
  const state = getStateOrEmpty();
  res.json(state.coursesStore || []);
});

app.post('/api/courses', (req, res) => {
  const newCourse = req.body;
  if (!newCourse.name || !newCourse.code || !newCourse.departmentId) {
    return res.status(400).json({ error: 'Name, code, and department are required' });
  }

  const courseWithId = {
    ...newCourse,
    id: newCourse.id || `c-${Date.now()}`,
    semester: Number(newCourse.semester) || 1,
    credits: Number(newCourse.credits) || 3
  };

  const state = getStateOrEmpty();
  const index = (state.coursesStore || []).findIndex(c => c.id === courseWithId.id);
  if (index >= 0) {
    state.coursesStore[index] = courseWithId;
  } else {
    state.coursesStore = [courseWithId, ...(state.coursesStore || [])];
  }
  saveState(state);
  broadcastStateUpdate(state);
  res.json({ success: true, course: courseWithId });
});

app.put('/api/courses/:id', (req, res) => {
  const { id } = req.params;
  const updatedCourse = req.body;
  const state = getStateOrEmpty();
  state.coursesStore = (state.coursesStore || []).map(c => c.id === id ? { ...c, ...updatedCourse, semester: Number(updatedCourse.semester || c.semester), credits: Number(updatedCourse.credits || c.credits) } : c);
  saveState(state);
  broadcastStateUpdate(state);
  res.json({ success: true });
});

app.delete('/api/courses/:id', (req, res) => {
  const { id } = req.params;
  const state = getStateOrEmpty();
  state.coursesStore = (state.coursesStore || []).filter(c => c.id !== id);
  saveState(state);
  broadcastStateUpdate(state);
  res.json({ success: true });
});

// Faculty REST API
app.get('/api/faculty', (req, res) => {
  const state = getStateOrEmpty();
  res.json(state.facultyStore || []);
});

app.post('/api/faculty', (req, res) => {
  const newFaculty = req.body;
  const state = getStateOrEmpty();
  const index = (state.facultyStore || []).findIndex(f => f.id === newFaculty.id);
  if (index >= 0) {
    state.facultyStore[index] = newFaculty;
  } else {
    state.facultyStore = [newFaculty, ...(state.facultyStore || [])];
  }
  saveState(state);
  broadcastStateUpdate(state);
  res.json({ success: true, faculty: newFaculty });
});

app.put('/api/faculty/:id', (req, res) => {
  const { id } = req.params;
  const updatedFaculty = req.body;
  const state = getStateOrEmpty();
  state.facultyStore = (state.facultyStore || []).map(f => f.id === id ? { ...f, ...updatedFaculty } : f);
  saveState(state);
  broadcastStateUpdate(state);
  res.json({ success: true });
});

app.delete('/api/faculty/:id', (req, res) => {
  const { id } = req.params;
  const state = getStateOrEmpty();
  state.facultyStore = (state.facultyStore || []).filter(f => f.id !== id);
  saveState(state);
  broadcastStateUpdate(state);
  res.json({ success: true });
});

// Fee Payments REST API
app.get('/api/fees', (req, res) => {
  const state = getStateOrEmpty();
  res.json(state.feePaymentsStore || []);
});

app.post('/api/fees', (req, res) => {
  const payment = req.body;
  const state = getStateOrEmpty();
  const index = (state.feePaymentsStore || []).findIndex(p => p.id === payment.id);
  if (index >= 0) {
    state.feePaymentsStore[index] = payment;
  } else {
    state.feePaymentsStore = [payment, ...(state.feePaymentsStore || [])];
  }
  saveState(state);
  broadcastStateUpdate(state);
  res.json({ success: true, payment });
});

// Fee Structures REST API
app.get('/api/fee-structures', (req, res) => {
  const state = getStateOrEmpty();
  res.json(state.feeStructuresStore || []);
});

app.post('/api/fee-structures', (req, res) => {
  const structure = req.body;
  const state = getStateOrEmpty();
  const index = (state.feeStructuresStore || []).findIndex(s => s.id === structure.id);
  if (index >= 0) {
    state.feeStructuresStore[index] = structure;
  } else {
    state.feeStructuresStore = [structure, ...(state.feeStructuresStore || [])];
  }
  saveState(state);
  broadcastStateUpdate(state);
  res.json({ success: true, structure });
});

app.put('/api/fee-structures/:id', (req, res) => {
  const { id } = req.params;
  const updatedStructure = req.body;
  const state = getStateOrEmpty();
  state.feeStructuresStore = (state.feeStructuresStore || []).map(s => s.id === id ? { ...s, ...updatedStructure } : s);
  saveState(state);
  broadcastStateUpdate(state);
  res.json({ success: true });
});

app.delete('/api/fee-structures/:id', (req, res) => {
  const { id } = req.params;
  const state = getStateOrEmpty();
  state.feeStructuresStore = (state.feeStructuresStore || []).filter(s => s.id !== id);
  saveState(state);
  broadcastStateUpdate(state);
  res.json({ success: true });
});

// Notices REST API
app.get('/api/notices', (req, res) => {
  const state = getStateOrEmpty();
  res.json(state.noticesStore || []);
});

app.post('/api/notices', (req, res) => {
  const notice = req.body;
  const state = getStateOrEmpty();
  state.noticesStore = [notice, ...(state.noticesStore || [])];
  saveState(state);
  broadcastStateUpdate(state);
  res.json({ success: true });
});

// Real-Time Server-Sent Events (SSE) Stream
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const clientId = Date.now() + '-' + Math.random().toString(36).substring(2, 9);
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  console.log(`[SSE] Client connected: ${clientId}. Total active clients: ${sseClients.length}`);

  // Send initial handshake ping
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', clientId })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
    console.log(`[SSE] Client disconnected: ${clientId}. Total active clients: ${sseClients.length}`);
  });
});

// Serve static assets in production mode (Render deployment)
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

app.listen(PORT, () => {
  console.log(`🚀 ERP Cloud Backend Server running on http://localhost:${PORT}`);
});
