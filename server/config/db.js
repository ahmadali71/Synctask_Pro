const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error(
      'MONGO_URI is not set. Copy server/.env.example to server/.env and set your MongoDB connection string.'
    );
    return null;
  }

  // Listen for connection events
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

  // Try to connect with retries
  const attemptConnection = async () => {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        bufferCommands: true,
      });
      return true;
    } catch (error) {
      console.error(`⚠️  MongoDB connection attempt failed: ${error.message}`);
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

module.exports = connectDB;
module.exports.getIsConnected = getIsConnected;
