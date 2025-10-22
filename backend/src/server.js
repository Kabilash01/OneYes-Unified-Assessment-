require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');
const logger = require('./config/logger');
const errorHandler = require('./middlewares/errorHandler');

// Import routes
const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const instructorRoutes = require('./routes/instructor.routes');
const adminRoutes = require('./routes/admin.routes');
const helpRoutes = require('./routes/help.routes');
const announcementRoutes = require('./routes/announcement.routes');
const userAnnouncementRoutes = require('./routes/userAnnouncement.routes');
const searchRoutes = require('./routes/search.routes');
const calendarRoutes = require('./routes/calendar.routes');
const supportRoutes = require('./routes/support.routes');
const chatRoutes = require('./routes/chat.routes');
const usersRoutes = require('./routes/users.routes');
const analyticsRoutes = require('./routes/analytics.routes');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB()
  .then(() => logger.info('MongoDB connected successfully'))
  .catch((err) => {
    logger.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  });

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }));
}

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10000, // 10000 requests per windowMs (increased for development)
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to auth routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// General rate limiter for all API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // 10000 requests per windowMs (increased for development)
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/help', helpRoutes);
app.use('/api/admin/announcements', announcementRoutes);
app.use('/api/announcements', userAnnouncementRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/analytics', analyticsRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Unified Assessment Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      student: '/api/student',
      instructor: '/api/instructor',
      admin: '/api/admin',
    },
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Initialize Socket.io
const { Server } = require('socket.io');
const { initializeSocketHandlers } = require('./sockets/chatSocket');

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize socket event handlers
initializeSocketHandlers(io);

// Make io available to routes (if needed)
app.set('io', io);

logger.info('Socket.io initialized');

// Initialize scheduled reports cron job
const cron = require('node-cron');
const reportService = require('./services/reportService');

// Run every hour to check for scheduled reports
cron.schedule('0 * * * *', async () => {
  logger.info('Running scheduled reports check...');
  try {
    const result = await reportService.executeScheduledReports();
    logger.info(`Scheduled reports executed: ${result.executed}`);
  } catch (error) {
    logger.error(`Error executing scheduled reports: ${error.message}`);
  }
});

logger.info('Scheduled reports cron job initialized (runs every hour)');

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  console.error('Uncaught Exception:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;
