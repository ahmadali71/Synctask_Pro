const mongoose = require('mongoose');

let connectionPromise = null;

/**
 * Connect to MongoDB. Returns a cached promise so the connection
 * is only established once, even across multiple serverless invocations.
 */
const connectDB = () => {
  if (connectionPromise) return connectionPromise;

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not set.');
    return Promise.reject(new Error('MONGO_URI is not set'));
  }

  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB Connected:', mongoose.connection.host);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB disconnected.');
    connectionPromise = null; // Allow reconnection on next request
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
    connectionPromise = null;
  });

  connectionPromise = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    bufferCommands: false,
  }).catch((err) => {
    connectionPromise = null;
    throw err;
  });

  return connectionPromise;
};

/**
 * Express middleware that ensures DB is connected before any route handler runs.
 * Usage: app.use(ensureDB);
 */
const ensureDB = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB middleware error:', err.message);
    res.status(503).json({ 
      message: 'Database unavailable. Please try again shortly.',
      error: process.env.NODE_ENV === 'production' ? null : err.message
    });
  }
};

module.exports = connectDB;
module.exports.ensureDB = ensureDB;
