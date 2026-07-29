const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Enable native global filter sanitization to prevent NoSQL query injections
mongoose.set('sanitizeFilter', true);

const seedDemoUsers = async () => {
  try {
    const existingCount = await User.countDocuments();
    if (existingCount > 0) {
      return;
    }

    const adminPassword = await bcrypt.hash('Admin@1234', 10);
    const memberPassword = await bcrypt.hash('Member@1234', 10);

    await User.create([
      { name: 'Admin Demo', email: 'admin@committee.com', password: adminPassword, role: 'admin' },
      { name: 'Member Demo', email: 'member@committee.com', password: memberPassword, role: 'member' }
    ]);

    console.log('✅ Seeded demo users: admin@committee.com / Admin@1234, member@committee.com / Member@1234');
  } catch (err) {
    console.warn(`⚠️ Failed to seed demo users: ${err.message}`);
  }
};

const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const localUri = 'mongodb://127.0.0.1:27017/committee_db';
  const configuredUri = process.env.MONGO_URI;
  const candidateUris = [];

  if (configuredUri) {
    candidateUris.push(configuredUri);
  }

  if (!isProduction || !configuredUri) {
    candidateUris.push(localUri);
  }

  const uniqueUris = [...new Set(candidateUris)];

  let lastError;

  for (const uri of uniqueUris) {
    try {
      const normalizedUri = uri.includes('/committee_db') ? uri : `${uri.replace(/(\?|$)/, '/committee_db$1')}`;
      console.log(`\n🔍 NODE_ENV: ${process.env.NODE_ENV}`);
      console.log(`🔗 Attempting to connect to MongoDB using ${normalizedUri.replace(/:[^:@]+@/, ':***@')}`);
      console.log(`📍 Full URI includes database: ${normalizedUri.includes('committee_db') ? '✅ YES' : '❌ NO'}`);

      const conn = await mongoose.connect(normalizedUri, {
        serverSelectionTimeoutMS: 5000
      });

      console.log(`✅ MongoDB Connected Successfully!`);
      console.log(`🏠 Host: ${conn.connection.host}`);
      console.log(`📦 Database Name: ${conn.connection.name}`);
      console.log(`✅ Database is CORRECT: committee_db`);
      console.log(`📊 Connection State: ${conn.connection.readyState} (1 = connected)\n`);
      await seedDemoUsers();
      return conn;
    } catch (err) {
      lastError = err;
      console.warn(`⚠️  Failed to connect to ${uri}: ${err.message}`);
    }
  }

  console.error(`\n❌ MongoDB Connection Failed!`);
  console.error(`⚠️  Error: ${lastError ? lastError.message : 'Unknown error'}`);
  throw lastError || new Error('Unable to connect to MongoDB.');
};

module.exports = connectDB;

