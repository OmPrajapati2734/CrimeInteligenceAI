import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("\x1b[36m%s\x1b[0m", "==========================================================");
console.log("\x1b[36m%s\x1b[0m", "  Initializing KSP Crime Intelligence OS Dev Environment  ");
console.log("\x1b[36m%s\x1b[0m", "==========================================================");

// Start Backend API Server
const backendPath = path.join(__dirname, 'functions', 'api', 'server.js');
console.log("\x1b[32m%s\x1b[0m", `[Backend] Spawning node ${backendPath}...`);
const backend = spawn('node', [backendPath], { 
  stdio: 'inherit',
  shell: true 
});

// Start Frontend Vite Server
console.log("\x1b[32m%s\x1b[0m", `[Frontend] Spawning vite dev server...`);
const frontend = spawn('npx', ['vite'], { 
  stdio: 'inherit',
  shell: true 
});

// Clean up child processes on exit
const cleanUp = () => {
  console.log("\n\x1b[33m%s\x1b[0m", "Shutting down active dev servers...");
  try {
    backend.kill();
  } catch {}
  try {
    frontend.kill();
  } catch {}
  process.exit();
};

process.on('SIGINT', cleanUp);
process.on('SIGTERM', cleanUp);
process.on('exit', cleanUp);
