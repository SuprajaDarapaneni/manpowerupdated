import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('\x1b[35m%s\x1b[0m', '=====================================================');
console.log('\x1b[35m%s\x1b[0m', '   ManPowerLink: Starting Admin Frontend & Backend  ');
console.log('\x1b[35m%s\x1b[0m', '=====================================================');
console.log('Central Backend:  admin/backend  -> http://localhost:5000');
console.log('Admin Frontend:   admin/frontend -> http://localhost:3000\n');

// 1. Spawn Backend Process
const backend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(rootDir, 'admin', 'backend'),
  stdio: 'pipe',
  shell: true,
});

backend.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[36m[BACKEND :5000]\x1b[0m ${data.toString()}`);
});

backend.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[BACKEND ERR]\x1b[0m ${data.toString()}`);
});

// 2. Spawn Frontend Process
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(rootDir, 'admin', 'frontend'),
  stdio: 'pipe',
  shell: true,
});

frontend.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[32m[ADMIN FRONTEND :3000]\x1b[0m ${data.toString()}`);
});

frontend.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[33m[FRONTEND ERR]\x1b[0m ${data.toString()}`);
});

const cleanup = () => {
  console.log('\n\x1b[35mShutting down services...\x1b[0m');
  try {
    if (backend && !backend.killed) {
      if (isWindows) {
        spawn('taskkill', ['/pid', backend.pid.toString(), '/f', '/t']);
      } else {
        backend.kill('SIGTERM');
      }
    }
  } catch {}
  try {
    if (frontend && !frontend.killed) {
      if (isWindows) {
        spawn('taskkill', ['/pid', frontend.pid.toString(), '/f', '/t']);
      } else {
        frontend.kill('SIGTERM');
      }
    }
  } catch {}
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
