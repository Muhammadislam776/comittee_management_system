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

const app = express();

// When running behind a proxy (Render, Vercel, Heroku, etc.) Express must
// trust the proxy so middleware like express-rate-limit can read the
// correct client IP from the X-Forwarded-For header. Enable in production.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Middleware
// Set security HTTP headers
app.use(helmet());

// Dynamic CORS configuration matching dev & prod client URLs
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean).map(origin => origin.trim().replace(/\/$/, ""));

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. Server-to-Server, curl, Postman)
    if (!origin) return callback(null, true);
    
    const sanitizedOrigin = origin.trim().replace(/\/$/, "");
    
    // 1. Exact match with allowedOrigins list
    const isAllowed = allowedOrigins.includes(sanitizedOrigin);
    
    // 2. Dynamic check for Vercel domains (including automatic preview/deployment branches)
    const isVercelSubdomain = sanitizedOrigin.endsWith('.vercel.app') || 
                              /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(sanitizedOrigin);
    
    if (isAllowed || isVercelSubdomain) {
      return callback(null, true);
    }
    
    const msg = `CORS blocked: Origin ${origin} is not allowed. Check backend environment variables (FRONTEND_URL).`;
    return callback(new Error(msg), false);
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
const notifications = require('./routes/notifications');
const logs = require('./routes/logs');
const ai = require('./routes/ai');
const health = require('./routes/health');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/committees', committees);
app.use('/api/meetings', meetings);
app.use('/api/tasks', tasks);
app.use('/api/polls', polls);
app.use('/api/chat', chat);
app.use('/api/documents', documents);
app.use('/api/analytics', analytics);
app.use('/api/notifications', notifications);
app.use('/api/logs', logs);
app.use('/api/ai', ai);
app.use('/api/health', health);


// Error handler middleware must be after routes
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
