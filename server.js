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
      submissionsStore: []
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
