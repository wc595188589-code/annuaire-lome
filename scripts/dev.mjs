import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function run(cmd, args) {
  const child = spawn(cmd, args, {
    cwd: root,
    stdio: 'inherit',
    shell: false,
    env: process.env,
  });
  child.on('exit', (code, signal) => {
    if (signal === 'SIGINT' || signal === 'SIGTERM') return;
    if (code !== 0 && code !== null) process.exit(code);
  });
  return child;
}

const server = run(process.execPath, ['server/index.js']);
const client = run(process.execPath, [
  path.join(root, 'node_modules', 'vite', 'bin', 'vite.js'),
]);

function shutdown() {
  server.kill();
  client.kill();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
