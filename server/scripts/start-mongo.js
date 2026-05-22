/**
 * Start local MongoDB for SyncTask Pro (Windows).
 * Uses PowerShell Start-Process to truly detach mongod from the terminal.
 * Run: npm run db:start
 */
const { execSync } = require('child_process');
const net = require('net');
const path = require('path');
const fs = require('fs');

const mongodPath = 'C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe';
const rootDir = path.resolve(__dirname, '../../');
const dbPath = path.join(rootDir, 'data', 'mongo');
const logDir = path.join(rootDir, 'data', 'mongo-log');
const logPath = path.join(logDir, 'mongod.log');
const pidFile = path.join(logDir, 'mongod.pid');

// ── Helpers ──────────────────────────────────────────────────────────

function ensureDirs() {
  if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true });
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
}

function isPortOpen(port, host = '127.0.0.1', timeoutMs = 1500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => { socket.destroy(); resolve(true); });
    socket.once('timeout', () => { socket.destroy(); resolve(false); });
    socket.once('error', () => { socket.destroy(); resolve(false); });
    socket.connect(port, host);
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  // 1. Check mongod exists
  if (!fs.existsSync(mongodPath)) {
    console.error('❌ MongoDB not found at', mongodPath);
    console.error('   Install: https://www.mongodb.com/try/download/community');
    process.exit(1);
  }

  ensureDirs();

  // 2. Already running?
  if (await isPortOpen(27017)) {
    console.log('✅ MongoDB is already running on 127.0.0.1:27017.');
    process.exit(0);
  }

  // 3. Clear stale lock file (from unclean shutdown)
  const lockFile = path.join(dbPath, 'mongod.lock');
  if (fs.existsSync(lockFile)) {
    const content = fs.readFileSync(lockFile, 'utf8').trim();
    if (content) {
      console.log('🔧 Clearing stale mongod.lock...');
      fs.writeFileSync(lockFile, '');
    }
  }

  // 4. Start mongod using PowerShell Start-Process (truly detached on Windows)
  console.log(`Starting MongoDB at ${dbPath}...`);
  const args = `--dbpath "${dbPath}" --logpath "${logPath}" --bind_ip 127.0.0.1 --port 27017`;
  const psCmd = `Start-Process -FilePath '${mongodPath}' -ArgumentList '${args}' -WindowStyle Hidden -PassThru | Select-Object -ExpandProperty Id`;

  let pid;
  try {
    pid = execSync(`powershell -NoProfile -Command "${psCmd}"`, { encoding: 'utf8' }).trim();
    fs.writeFileSync(pidFile, pid);
  } catch (e) {
    console.error('❌ Failed to start mongod:', e.message);
    process.exit(1);
  }

  // 5. Wait for mongod to be ready (up to 10 seconds)
  console.log(`   Waiting for MongoDB (PID: ${pid}) to accept connections...`);
  for (let i = 0; i < 10; i++) {
    await sleep(1000);
    if (await isPortOpen(27017)) {
      console.log(`✅ MongoDB started successfully (PID: ${pid}).`);
      console.log(`   Run 'npm run db:stop' to stop it later.`);
      process.exit(0);
    }
  }

  console.error('⚠️  MongoDB process started but is not accepting connections yet.');
  console.error('   Check logs: ' + logPath);
  process.exit(1);
}

main();
