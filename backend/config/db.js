const mongoose = require('mongoose');

// Enable native global filter sanitization to prevent NoSQL query injections
mongoose.set('sanitizeFilter', true);

const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const localUri = 'mongodb://127.0.0.1:27017/committee_db';
  const uri = process.env.MONGO_URI || (!isProduction ? localUri : null);

  if (!uri) {
    throw new Error('MONGO_URI is required in production. Set the MongoDB Atlas connection string in the deployment environment.');
  }

  try {
    console.log(`Attempting to connect to MongoDB...`);
    
    // Set connection timeout lower to fail fast when the database is unreachable
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB Connection Error: ${err.message}`);
    throw err;
  }
};

module.exports = connectDB;

