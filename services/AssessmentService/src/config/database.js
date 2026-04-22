const mongoose = require('mongoose');

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/eduflex_assessments';

const connectDB = async () => {
  const configuredUri = process.env.MONGODB_URI;
  const primaryUri = configuredUri || DEFAULT_URI;

  try {
    const conn = await mongoose.connect(primaryUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (configuredUri && configuredUri !== DEFAULT_URI) {
      console.warn(`⚠️ Primary MongoDB URI failed: ${error.message}`);
      console.warn(`↩️ Falling back to local MongoDB: ${DEFAULT_URI}`);
      try {
        const fallbackConn = await mongoose.connect(DEFAULT_URI);
        console.log(`✅ MongoDB Connected: ${fallbackConn.connection.host}`);
        return;
      } catch (fallbackError) {
        console.error(`❌ MongoDB fallback failed: ${fallbackError.message}`);
        process.exit(1);
      }
    }

    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
