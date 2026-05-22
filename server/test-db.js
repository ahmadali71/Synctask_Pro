const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB Atlas...');
    await mongoose.connect('mongodb+srv://SynctaskPro71:SynctaskPro71@synctaskpro.3ichm09.mongodb.net/synctask-pro', {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Success! Connected to MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to connect:', error);
    process.exit(1);
  }
}

testConnection();
