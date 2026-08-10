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

app.use(express.json({ limit: '15mb' }));

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

// ================= API ENDPOINTS =================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), clientsCount: sseClients.length });
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

// Real-Time Server-Sent Events (SSE) Stream
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const clientId = Date.now() + '-' + Math.random().toString(36).substring(2, 9);
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  console.log(`[SSE] Client connected: ${clientId}. Total active clients: ${sseClients.length}`);

  // Send initial handshake ping
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', clientId })}\n\n`);

  // Send heartbeat ping every 15s to keep HTTP connection alive through proxies
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch (e) {
      clearInterval(heartbeat);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
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
