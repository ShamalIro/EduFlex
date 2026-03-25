const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Always resolve the service-local .env so running from other directories still works
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

const requiredEnvVars = ['MONGODB_URI'];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    throw err;
  }
};

module.exports = {
  connectDB,
  mongoose
};