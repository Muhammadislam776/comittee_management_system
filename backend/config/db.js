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
    console.log(`\n🔍 NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`🔗 Attempting to connect to MongoDB...`);
    console.log(`📍 Connection String: ${uri.substring(0, 50)}...`);
    
    // Set connection timeout lower to fail fast when the database is unreachable
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 
    });
    
    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`🏠 Host: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
    console.log(`📊 State: ${conn.connection.readyState} (1 = connected)\n`);
    
  } catch (err) {
    console.error(`\n❌ MongoDB Connection Failed!`);
    console.error(`⚠️  Error: ${err.message}`);
    console.error(`📍 Make sure MongoDB Atlas is accessible and credentials are correct\n`);
    throw err;
  }
};

module.exports = connectDB;

