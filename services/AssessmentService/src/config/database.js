const mongoose = require('mongoose');

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/eduflex_assessments';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || DEFAULT_URI;
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
