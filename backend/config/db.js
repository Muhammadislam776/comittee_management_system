const mongoose = require('mongoose');

// Enable native global filter sanitization to prevent NoSQL query injections
mongoose.set('sanitizeFilter', true);

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/committee_db';
    console.log(`Attempting to connect to MongoDB...`);
    
    // Set connection timeout lower to fall back faster if network is blocked
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.warn(`\n⚠️  Atlas connection failed: ${err.message}\n⚡ Falling back to local MongoDB...`);
    try {
      const conn = await mongoose.connect('mongodb://127.0.0.1:27017/committee_db', {
        serverSelectionTimeoutMS: 5000
      });
      console.log(`MongoDB Connected (Local Fallback): ${conn.connection.host}`);
    } catch (localErr) {
      console.error(`❌ Local MongoDB Connection Error: ${localErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;

