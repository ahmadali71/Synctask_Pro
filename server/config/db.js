const mongoose = require('mongoose');
const { spawn } = require('child_process');
const net = require('net');
const path = require('path');
const fs = require('fs');

let isConnected = false;
let mongodProcess = null;

// ── Helpers ──────────────────────────────────────────────────────────

const MONGOD_PATH = 'C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe';
const ROOT_DIR = path.resolve(__dirname, '../../');
const DB_PATH = path.join(ROOT_DIR, 'data', 'mongo');
const LOG_DIR = path.join(ROOT_DIR, 'data', 'mongo-log');
const LOG_PATH = path.join(LOG_DIR, 'mongod.log');

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

/**
 * Auto-start a local mongod process if the URI points to localhost
 * and nothing is already listening on port 27017.
 * The mongod child lives as long as this Node process lives.
 */
async function ensureLocalMongod(uri) {
  // Only auto-start for local URIs
  if (!uri.includes('127.0.0.1') && !uri.includes('localhost')) return;
  if (!fs.existsSync(MONGOD_PATH)) return;

  // Already running?
  if (await isPortOpen(27017)) return;

  // Ensure directories
  if (!fs.existsSync(DB_PATH)) fs.mkdirSync(DB_PATH, { recursive: true });
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

  // Clear stale lock
  const lockFile = path.join(DB_PATH, 'mongod.lock');
  if (fs.existsSync(lockFile)) {
    const content = fs.readFileSync(lockFile, 'utf8').trim();
    if (content) {
      console.log('🔧 Clearing stale mongod.lock...');
      fs.writeFileSync(lockFile, '');
    }
  }

  console.log('🚀 Auto-starting local MongoDB...');

  mongodProcess = spawn(MONGOD_PATH, [
    '--dbpath', DB_PATH,
    '--logpath', LOG_PATH,
    '--bind_ip', '127.0.0.1',
    '--port', '27017',
  ], {
    stdio: 'ignore',
    windowsHide: true,
  });

  mongodProcess.on('error', (err) => {
    console.error('❌ Failed to start mongod:', err.message);
    mongodProcess = null;
  });

  mongodProcess.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.error(`⚠️  mongod exited with code ${code}. Check: ${LOG_PATH}`);
    }
    mongodProcess = null;
  });

  // Wait for port to be ready (up to 15 seconds)
  for (let i = 0; i < 15; i++) {
    await sleep(1000);
    if (await isPortOpen(27017)) {
      console.log(`✅ Local MongoDB ready (PID: ${mongodProcess?.pid})`);
      return;
    }
  }

  console.error('⚠️  MongoDB started but is not accepting connections.');
  console.error(`   Check logs: ${LOG_PATH}`);
}

/**
 * Gracefully stop the managed mongod process.
 */
function stopLocalMongod() {
  if (mongodProcess) {
    console.log('Stopping local MongoDB...');
    mongodProcess.kill('SIGTERM');
    mongodProcess = null;
  }
}

// ── Database Connection ──────────────────────────────────────────────

let connectionPromise = null;
let listenersAttached = false;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return mongoose.connection;
  }

  if (connectionPromise) {
    await connectionPromise;
    return mongoose.connection;
  }

  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error(
      'MONGO_URI is not set. Copy server/.env.example to server/.env and set your MongoDB connection string.'
    );
    return null;
  }

  // Auto-start local MongoDB if needed
  await ensureLocalMongod(uri);

  // Listen for connection events (register once)
  if (!listenersAttached) {
    mongoose.connection.on('connected', () => {
      isConnected = true;
      console.log('✅ MongoDB Connected:', mongoose.connection.host);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.log('⚠️  MongoDB disconnected.');
    });

    mongoose.connection.on('error', (err) => {
      isConnected = false;
      console.error('MongoDB connection error:', err.message);
    });
    listenersAttached = true;
  }

  // Try to connect with retries
  const attemptConnection = async () => {
    try {
      connectionPromise = mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        bufferCommands: false, // Fail fast if DB is disconnected
      });
      await connectionPromise;
      return true;
    } catch (error) {
      console.error(`⚠️  MongoDB connection attempt failed: ${error.message}`);
      connectionPromise = null;
      return false;
    }
  };

  // Initial attempt
  const connected = await attemptConnection();

  if (!connected) {
    console.error('   The server will start without DB. Retrying in background...');
    console.error('   → Make sure MongoDB is running: npm run db:start\n');

    // Keep retrying every 5 seconds until connected
    const retryInterval = setInterval(async () => {
      console.log('🔄 Retrying MongoDB connection...');
      const success = await attemptConnection();
      if (success) {
        console.log('✅ MongoDB reconnected successfully!');
        clearInterval(retryInterval);
      }
    }, 5000);
  }

  return mongoose.connection;
};

const getIsConnected = () => isConnected;

// Clean up mongod on process exit
process.on('exit', stopLocalMongod);
process.on('SIGINT', () => { stopLocalMongod(); process.exit(0); });
process.on('SIGTERM', () => { stopLocalMongod(); process.exit(0); });

module.exports = connectDB;
module.exports.getIsConnected = getIsConnected;
