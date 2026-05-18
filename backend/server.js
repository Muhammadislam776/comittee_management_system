const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const http = require('http');
const path = require('path');
const { initSocket } = require('./socket');

// Security imports
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
// Set security HTTP headers
app.use(helmet());

// Dynamic CORS configuration matching dev & prod client URLs
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// Rate Limiting to prevent brute-force (100 reqs per 10 mins per IP)
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 15000, // Very generous during development
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again in 10 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', apiLimiter);

// Serve local uploads statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route files
const auth = require('./routes/auth');
const committees = require('./routes/committees');
const meetings = require('./routes/meetings');
const tasks = require('./routes/tasks');
const polls = require('./routes/polls');
const chat = require('./routes/chat');
const documents = require('./routes/documents');
const analytics = require('./routes/analytics');
const ai = require('./routes/ai');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/committees', committees);
app.use('/api/meetings', meetings);
app.use('/api/tasks', tasks);
app.use('/api/polls', polls);
app.use('/api/chat', chat);
app.use('/api/documents', documents);
app.use('/api/analytics', analytics);
app.use('/api/ai', ai);

// Error handler middleware must be after routes
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
