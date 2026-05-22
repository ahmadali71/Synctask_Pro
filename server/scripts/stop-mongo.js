/**
 * Stop local MongoDB for SyncTask Pro (Windows).
 * Run: npm run db:stop
 */
const { execSync } = require('child_process');
const net = require('net');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../');
const pidFile = path.join(rootDir, 'data', 'mongo-log', 'mongod.pid');

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

async function main() {
  const running = await isPortOpen(27017);
  if (!running) {
    console.log('MongoDB does not appear to be running on port 27017.');
    if (fs.existsSync(pidFile)) fs.unlinkSync(pidFile);
    process.exit(0);
  }

  // Try reading PID from file, fall back to finding the process
  let pid = null;
  if (fs.existsSync(pidFile)) {
    pid = fs.readFileSync(pidFile, 'utf8').trim();
  }

  if (!pid) {
    // Find mongod process via PowerShell
    try {
      pid = execSync(
        'powershell -NoProfile -Command "(Get-Process mongod -ErrorAction SilentlyContinue | Select-Object -First 1).Id"',
        { encoding: 'utf8' }
      ).trim();
    } catch (e) {
      // ignore
    }
  }

  if (!pid) {
    console.error('❌ Could not find the MongoDB process ID to stop.');
    process.exit(1);
  }

  try {
    console.log(`Stopping MongoDB (PID: ${pid})...`);
    execSync(`powershell -NoProfile -Command "Stop-Process -Id ${pid} -Force"`, { encoding: 'utf8' });
    console.log('✅ MongoDB stopped successfully.');
    if (fs.existsSync(pidFile)) fs.unlinkSync(pidFile);
  } catch (e) {
    console.error(`❌ Failed to stop MongoDB: ${e.message}`);
  }
}

main();
