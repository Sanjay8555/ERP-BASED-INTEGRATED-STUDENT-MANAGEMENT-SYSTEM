import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🚀 Starting ERP Integrated Development Environment...');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npx.cmd' : 'npx';
const nodeCmd = 'node';

// Spawn Express Backend Server (Port 5000)
const backend = spawn(nodeCmd, ['server.js'], {
  cwd: rootDir,
  stdio: 'pipe',
  shell: true,
  env: { ...process.env, PORT: '5000' }
});

backend.stdout.on('data', (data) => {
  const line = data.toString().trim();
  if (line) console.log(`\x1b[36m[Backend]\x1b[0m ${line}`);
});

backend.stderr.on('data', (data) => {
  const line = data.toString().trim();
  if (line) console.error(`\x1b[31m[Backend Error]\x1b[0m ${line}`);
});

// Spawn Vite Frontend Dev Server (Port 3000)
const frontend = spawn(npmCmd, ['vite', '--port=3000', '--host=0.0.0.0'], {
  cwd: rootDir,
  stdio: 'pipe',
  shell: true
});

frontend.stdout.on('data', (data) => {
  const line = data.toString().trim();
  if (line) console.log(`\x1b[32m[Frontend]\x1b[0m ${line}`);
});

frontend.stderr.on('data', (data) => {
  const line = data.toString().trim();
  if (line) console.error(`\x1b[33m[Frontend]\x1b[0m ${line}`);
});

const cleanup = () => {
  console.log('\n🛑 Shutting down backend and frontend servers...');
  try {
    backend.kill();
    frontend.kill();
  } catch (e) {}
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
