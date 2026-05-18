const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load models
const User = require('../models/User');
const Committee = require('../models/Committee');
const Meeting = require('../models/Meeting');
const Task = require('../models/Task');
const Poll = require('../models/Poll');
const Message = require('../models/Message');
const Document = require('../models/Document');

// Load env vars
dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/committee_db';
    console.log(`Connecting to database for seeding...`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`Connected to database for seeding: ${conn.connection.host}`);
  } catch (err) {
    console.warn(`⚠️  Atlas seeding connection failed: ${err.message}\n⚡ Falling back to local MongoDB for seeding...`);
    try {
      const conn = await mongoose.connect('mongodb://127.0.0.1:27017/committee_db', {
        serverSelectionTimeoutMS: 5000
      });
      console.log(`Connected to local database for seeding: ${conn.connection.host}`);
    } catch (localErr) {
      console.error(`❌ Local MongoDB Seeding Connection Error: ${localErr.message}`);
      process.exit(1);
    }
  }
};

const seedData = async () => {
  try {
    // 1. Clear database
    console.log('Clearing existing database collections...');
    await User.deleteMany();
    await Committee.deleteMany();
    await Meeting.deleteMany();
    await Task.deleteMany();
    await Poll.deleteMany();
    await Message.deleteMany();
    await Document.deleteMany();
    console.log('Existing data cleared successfully.');

    // 2. Generate hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 3. Create Users
    console.log('Seeding user records...');
    const users = await User.create([
      { name: 'Admin Operations Head', email: 'admin@example.com', password: hashedPassword, role: 'admin' },
      { name: 'Dr. Jane Smith (Finance)', email: 'head.finance@example.com', password: hashedPassword, role: 'committee_head' },
      { name: 'Prof. Alan Turing (Tech)', email: 'head.tech@example.com', password: hashedPassword, role: 'committee_head' },
      { name: 'Sarah Connor (PR)', email: 'head.marketing@example.com', password: hashedPassword, role: 'committee_head' },
      { name: 'John Doe', email: 'john@example.com', password: hashedPassword, role: 'member' },
      { name: 'Alice Johnson', email: 'alice@example.com', password: hashedPassword, role: 'member' },
      { name: 'Bob Williams', email: 'bob@example.com', password: hashedPassword, role: 'member' },
      { name: 'Charlie Brown', email: 'charlie@example.com', password: hashedPassword, role: 'member' }
    ]);
    console.log(`Successfully seeded ${users.length} user accounts (Default Password: "password123")`);

    const admin = users[0];
    const headFinance = users[1];
    const headTech = users[2];
    const headMarketing = users[3];
    const memberJohn = users[4];
    const memberAlice = users[5];
    const memberBob = users[6];
    const memberCharlie = users[7];

    // 4. Create Committees
    console.log('Seeding committee groups...');
    const committees = await Committee.create([
      {
        name: 'Finance & Audit Committee',
        description: 'Oversees organizational budgeting, financial reports, structural audits, and asset allocations.',
        category: 'Finance',
        head: headFinance._id,
        members: [memberJohn._id, memberAlice._id, headFinance._id],
        status: 'Active'
      },
      {
        name: 'Technical Advisory Board',
        description: 'Reviews software architecture design specs, IT infrastructures, cyber security guidelines, and server clusters.',
        category: 'Technical',
        head: headTech._id,
        members: [memberBob._id, memberCharlie._id, headTech._id],
        status: 'Active'
      },
      {
        name: 'Marketing & Public Relations',
        description: 'Manages global campaigns, external branding announcements, media advisories, and community outreach operations.',
        category: 'Marketing',
        head: headMarketing._id,
        members: [memberJohn._id, memberCharlie._id, headMarketing._id],
        status: 'Active'
      }
    ]);
    console.log(`Successfully seeded ${committees.length} committees.`);

    const financeComm = committees[0];
    const techComm = committees[1];
    const marketingComm = committees[2];

    // 5. Seeding Meetings
    console.log('Seeding meeting schedules & attendance lists...');
    const pastDate1 = new Date(); pastDate1.setDate(pastDate1.getDate() - 15);
    const pastDate2 = new Date(); pastDate2.setDate(pastDate2.getDate() - 5);
    const futureDate1 = new Date(); futureDate1.setDate(futureDate1.getDate() + 3);
    const futureDate2 = new Date(); futureDate2.setDate(futureDate2.getDate() + 10);

    const meetings = await Meeting.create([
      {
        title: 'Q1 Financial Budget Reconciliation',
        date: pastDate1,
        endDate: new Date(pastDate1.getTime() + 60 * 60 * 1000),
        location: 'Boardroom A / Zoom Dial-in',
        committee: financeComm._id,
        agenda: '1. Review past quarter expenditures\n2. Discuss treasury reserves\n3. Audit outstanding department liabilities.',
        minutes: 'Approved budget report revisions. Verified cloud computing asset cost lines. Action task assigned to John to submit reports by Friday.',
        status: 'Completed',
        attendance: [
          { user: headFinance._id, status: 'Present', markedAt: pastDate1 },
          { user: memberJohn._id, status: 'Present', markedAt: pastDate1 },
          { user: memberAlice._id, status: 'Present', markedAt: pastDate1 }
        ],
        createdBy: headFinance._id
      },
      {
        title: 'Cloud Security Audit & API Gateways Review',
        date: pastDate2,
        endDate: new Date(pastDate2.getTime() + 90 * 60 * 1000),
        location: 'Virtual Hangout / Slack-Link',
        committee: techComm._id,
        agenda: '1. Evaluate security middleware configurations\n2. Assess NoSQL injection preventions\n3. Review Vercel Custom headers.',
        minutes: 'Analyzed helmet headers. Confirmed MongoDB Atlas access whitelist ranges are locked. Instructed Bob to complete Express sanitization hooks.',
        status: 'Completed',
        attendance: [
          { user: headTech._id, status: 'Present', markedAt: pastDate2 },
          { user: memberBob._id, status: 'Present', markedAt: pastDate2 },
          { user: memberCharlie._id, status: 'Absent', markedAt: pastDate2 }
        ],
        createdBy: headTech._id
      },
      {
        title: 'Technical Advisory Board - Scrum Session',
        date: futureDate1,
        endDate: new Date(futureDate1.getTime() + 45 * 60 * 1000),
        location: 'Room 302',
        committee: techComm._id,
        agenda: '1. Bi-weekly scrum checks\n2. Task updates on Kanban widgets\n3. Dynamic CORS whitelists testing.',
        status: 'Scheduled',
        attendance: [
          { user: headTech._id, status: 'Present', markedAt: futureDate1 },
          { user: memberBob._id, status: 'Present', markedAt: futureDate1 },
          { user: memberCharlie._id, status: 'Present', markedAt: futureDate1 }
        ],
        createdBy: headTech._id
      },
      {
        title: 'Treasury Audit & Reserve Fund Analysis',
        date: futureDate2,
        endDate: new Date(futureDate2.getTime() + 60 * 60 * 1000),
        location: 'Audit Room B',
        committee: financeComm._id,
        agenda: '1. Presentation by Dr. Jane Smith on external audit results\n2. Reallocate unspent server hosting cash reserves.',
        status: 'Scheduled',
        attendance: [],
        createdBy: headFinance._id
      }
    ]);
    console.log(`Successfully seeded ${meetings.length} meeting records.`);

    const meetingFinanceQ1 = meetings[0];
    const meetingTechAudit = meetings[1];

    // 6. Seeding Tasks
    console.log('Seeding task boards...');
    const tasks = await Task.create([
      {
        title: 'Format Q1 Expenditure Spreadsheets',
        description: 'Generate finalized XLSX sheets for budget checks. Double check Cloudinary pricing lines.',
        assignedTo: memberJohn._id,
        meeting: meetingFinanceQ1._id,
        status: 'Completed',
        priority: 'High',
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        comments: [
          { text: 'Completed the treasury check sheet, uploading now.', user: memberJohn._id }
        ]
      },
      {
        title: 'Configure Helmet Security Headers in Express',
        description: 'Verify app.use(helmet()) setup is active and block MIME sniffing.',
        assignedTo: memberBob._id,
        meeting: meetingTechAudit._id,
        status: 'Completed',
        priority: 'High',
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        comments: [
          { text: 'Merged and verified under server logs!', user: memberBob._id }
        ]
      },
      {
        title: 'Test Production CORS Dynamic Filter',
        description: 'Confirm allowedOrigins logic properly whitelists frontend next.js build domains.',
        assignedTo: memberCharlie._id,
        status: 'In Progress',
        priority: 'Medium',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Draft PR Campaign Launch Copy',
        description: 'Design dynamic announcements copy detailing system upgrades for social releases.',
        assignedTo: memberCharlie._id,
        status: 'Pending',
        priority: 'Low',
        deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Prepare Audit Committee Slides',
        description: 'Generate 5 slides detailing budget reallocations for board analysis.',
        assignedTo: memberAlice._id,
        status: 'Pending',
        priority: 'High',
        deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
      }
    ]);
    console.log(`Successfully seeded ${tasks.length} task items.`);

    // 7. Seeding Polls
    console.log('Seeding interactive polls & votes...');
    const pollExpiry = new Date(); pollExpiry.setDate(pollExpiry.getDate() + 7);
    const polls = await Poll.create([
      {
        title: 'Adopt Next.js 15 for Frontend Upgrade?',
        description: 'Determine if team should migrate from Next 14 to Next 15 in this quarterly cycle.',
        committee: techComm._id,
        options: [
          { text: 'Yes, upgrade immediately', voteCount: 4 },
          { text: 'No, wait for next cycle release', voteCount: 1 }
        ],
        expiresAt: pollExpiry,
        status: 'Active',
        createdBy: headTech._id,
        voters: [memberBob._id, memberCharlie._id, headTech._id, admin._id]
      },
      {
        title: 'Schedule Weekly Sync Slot',
        description: 'Choose the most convenient weekday block for Finance status audits.',
        committee: financeComm._id,
        options: [
          { text: 'Tuesday 10:30 AM', voteCount: 3 },
          { text: 'Thursday 3:00 PM', voteCount: 1 },
          { text: 'Friday 9:00 AM', voteCount: 0 }
        ],
        expiresAt: pollExpiry,
        status: 'Active',
        createdBy: headFinance._id,
        voters: [memberJohn._id, memberAlice._id, headFinance._id]
      }
    ]);
    console.log(`Successfully seeded ${polls.length} polls.`);

    // 8. Seeding Documents
    console.log('Seeding operational documents...');
    const documents = await Document.create([
      {
        title: 'Q1 Budget Finalized Report',
        description: 'Comprehensive finalized budget allocation spreadsheets.',
        committee: financeComm._id,
        createdBy: headFinance._id,
        approvalStatus: 'Approved',
        approvedBy: admin._id,
        approvalDate: new Date(),
        currentVersion: 1,
        versions: [
          {
            version: 1,
            url: 'https://res.cloudinary.com/demo/image/upload/v12345678/sample.pdf',
            fileName: 'Q1_Budget_Finalized.pdf',
            uploadedBy: headFinance._id,
            createdAt: new Date()
          }
        ]
      },
      {
        title: 'Technical Security Policy Framework',
        description: 'Security middleware configuration directives.',
        committee: techComm._id,
        createdBy: headTech._id,
        approvalStatus: 'Pending',
        currentVersion: 2,
        versions: [
          {
            version: 1,
            url: 'https://res.cloudinary.com/demo/image/upload/v12345678/sample_v1.pdf',
            fileName: 'Technical_Security_Framework_v1.pdf',
            uploadedBy: headTech._id,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
          },
          {
            version: 2,
            url: 'https://res.cloudinary.com/demo/image/upload/v12345678/sample.pdf',
            fileName: 'Technical_Security_Framework_v2.pdf',
            uploadedBy: headTech._id,
            createdAt: new Date()
          }
        ]
      }
    ]);
    console.log(`Successfully seeded ${documents.length} document assets.`);

    // 9. Seeding Chat Messages
    console.log('Seeding channels chat history...');
    await Message.create([
      { committee: techComm._id, sender: headTech._id, text: 'Hello tech advisory members. Welcome to the workspace chat!' },
      { committee: techComm._id, sender: memberBob._id, text: 'Hi Jane, looking forward to starting the cloud audits.' },
      { committee: techComm._id, sender: memberCharlie._id, text: 'Ready to review Vercel deployment configurations!' },
      { committee: financeComm._id, sender: headFinance._id, text: 'Audit team, please verify John’s spreadsheet uploads.' }
    ]);
    console.log('Successfully seeded live chat logs.');

    console.log('\n======================================================');
    console.log('🎉 SEEDING PROCESS COMPLETED SUCCESSFULLY! 🎉');
    console.log('Default Password for All Users: "password123"');
    console.log('Example logins:');
    console.log(' - Admin: admin@example.com');
    console.log(' - Finance Head: head.finance@example.com');
    console.log(' - Tech Head: head.tech@example.com');
    console.log(' - Member: john@example.com / alice@example.com');
    console.log('======================================================\n');

    process.exit(0);
  } catch (err) {
    console.error(`Seeding critical error: ${err.message}`);
    process.exit(1);
  }
};

// Execute
(async () => {
  await connectDB();
  await seedData();
})();
