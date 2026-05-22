const app = require('../app.js');
const connectDB = require('../config/db.js');

// Establish Database Connection for Vercel Serverless environment
connectDB();

module.exports = app;
