const mongoose = require('mongoose');

// Enable native global filter sanitization to prevent NoSQL query injections
mongoose.set('sanitizeFilter', true);

const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const localUri = 'mongodb://127.0.0.1:27017/committee_db';
  let uri = process.env.MONGO_URI || (!isProduction ? localUri : null);

  if (!uri) {
    throw new Error('MONGO_URI is required in production. Set the MongoDB Atlas connection string in the deployment environment.');
  }

  // Ensure database name is in the URI
  if (!uri.includes('/committee_db')) {
    console.warn('⚠️  Warning: committee_db not found in URI. Appending it now...');
    uri = uri.replace(/(\?|$)/, '/committee_db$1');
  }

  try {
    console.log(`\n🔍 NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`🔗 Attempting to connect to MongoDB...`);
    console.log(`📍 Full URI includes database: ${uri.includes('committee_db') ? '✅ YES' : '❌ NO'}`);
    
    // Set connection timeout lower to fail fast when the database is unreachable
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 
    });
    
    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`🏠 Host: ${conn.connection.host}`);
    console.log(`📦 Database Name: ${conn.connection.name}`);
    
    // Verify correct database
    if (conn.connection.name !== 'committee_db') {
      console.error(`\n❌ ERROR: Connected to "${conn.connection.name}" instead of "committee_db"`);
      console.error(`📝 Make sure MONGO_URI includes /committee_db`);
      throw new Error(`Wrong database: ${conn.connection.name}. Expected: committee_db`);
    }
    
    console.log(`✅ Database is CORRECT: committee_db`);
    console.log(`📊 Connection State: ${conn.connection.readyState} (1 = connected)\n`);
    
  } catch (err) {
    console.error(`\n❌ MongoDB Connection Failed!`);
    console.error(`⚠️  Error: ${err.message}`);
    console.error(`📍 Make sure:`);
    console.error(`   1. MONGO_URI includes /committee_db`);
    console.error(`   2. MongoDB Atlas credentials are correct`);
    console.error(`   3. Server has been RESTARTED after .env changes\n`);
    throw err;
  }
};

module.exports = connectDB;

