const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error(
      'MONGO_URI is not set. Copy server/.env.example to server/.env and set your MongoDB connection string.'
    );
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`\n⚠️  MongoDB connection failed: ${error.message}`);
    console.error('   The server will start, but database-dependent routes will fail until connected.');
    console.error('   → Make sure MongoDB is running (e.g. npm run db:start)\n');
    
    // Attempt to reconnect in the background
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Retrying...');
      setTimeout(() => {
        mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 }).catch(() => {});
      }, 5000);
    });
    
    // Do not throw the error so the server can still start
    return null;
  }
};

module.exports = connectDB;
