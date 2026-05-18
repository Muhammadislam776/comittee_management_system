const mongoose = require('mongoose');

// Enable native global filter sanitization to prevent NoSQL query injections
mongoose.set('sanitizeFilter', true);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/committee_db');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

