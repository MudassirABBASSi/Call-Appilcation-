require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const { generalLimiter, authLimiter, passwordResetLimiter, otpVerifyLimiter } = require('./middleware/rateLimiter');
const { csrfProtection, getCsrfToken, csrfErrorHandler } = require('./middleware/csrfProtection');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const teacherRoutes = require('./routes/teacher');
const studentRoutes = require('./routes/student');
const attendanceRoutes = require('./routes/attendance');
const courseRoutes = require('./routes/courses');
const assignmentRoutes = require('./routes/assignments');
// const submissionRoutes = require('./routes/submissions');  // Disabled - using teacher/student routes instead
const classRoutes = require('./routes/classes');
const notificationRoutes = require('./routes/notifications');
const messageRoutes = require('./routes/messages');
const conversationRoutes = require('./routes/conversations');
const notificationScheduler = require('./utils/notificationScheduler');
const { startAssignmentReminderCron } = require('./cron/assignmentReminders');
const { startClassReminderCron } = require('./cron/classReminderCron');

const app = express();

/**
 * Process-level error handlers
 * Prevent crashes from unhandled errors and promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('🔴 Unhandled Promise Rejection at:', promise, 'reason:', reason);
  // Log the error but allow the process to continue
});

process.on('uncaughtException', (error) => {
  console.error('🔴 Uncaught Exception:', error);
  // Log the error but allow the process to continue
  // In production, you might want to restart the process
});

// Middleware
// CORS configuration with credentials support for CSRF protection
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // Allow cookies and credentials in cross-origin requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(cookieParser()); // Enable cookie parsing for CSRF protection

// Apply CSRF protection middleware (must come after cookie-parser)
// This sets up CSRF token generation and validation for all routes
app.use(csrfProtection);

// Apply Rate Limiting Middleware
// General rate limiter: 100 requests per 15 minutes per IP
app.use(generalLimiter);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
// Auth routes with strict rate limiting (5 requests per 15 minutes)
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assignments', assignmentRoutes);
// app.use('/api/submissions', submissionRoutes);  // Disabled - using teacher/student routes instead
app.use('/api/classes', classRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes);

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Alburhan Classroom API is running' });
});

// CSRF Token route - Public endpoint to fetch CSRF token
// Frontend must call this once on app initialization
app.get('/api/csrf-token', getCsrfToken);

// CSRF Error Handler - Must be placed after all routes
// Catches CSRF validation errors and returns proper response
app.use(csrfErrorHandler);

/**
 * Global Error Handler Middleware
 * Handles all unhandled errors and prevents server crashes
 * Must be defined after all routes and middleware
 */
app.use((err, req, res, next) => {
  console.error('🔴 Error caught by global handler:', {
    message: err.message,
    code: err.code,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle multer file size limit errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum file size is 5MB.',
      error: 'FILE_SIZE_EXCEEDED'
    });
  }

  // Handle multer field size limit errors
  if (err.code === 'LIMIT_FIELD_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Field value too large.',
      error: 'FIELD_SIZE_EXCEEDED'
    });
  }

  // Handle multer invalid file type errors
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Too many files. Maximum 10 files allowed.',
      error: 'FILE_COUNT_EXCEEDED'
    });
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body.',
      error: 'INVALID_JSON'
    });
  }

  // Handle validation errors
  if (err.code === 'VALIDATION_ERROR' || err.isJoi) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: 'VALIDATION_ERROR',
      details: err.details
    });
  }

  // Handle database errors (avoid exposing sensitive information)
  if (err.code && err.code.startsWith('ER_')) {
    console.error('Database error:', err.code);
    return res.status(500).json({
      success: false,
      message: 'Database error. Please try again later.',
      error: 'DATABASE_ERROR'
    });
  }

  // Handle async/promise rejection errors
  if (err.name === 'UnhandledPromiseRejection') {
    console.error('Unhandled promise rejection:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: 'UNHANDLED_REJECTION'
    });
  }

  // Check if response has already been sent
  if (res.headersSent) {
    console.error('Error occurred after response was sent. Headers already sent.');
    return next(err);
  }

  // Default error response
  const statusCode = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error. Please try again later.'
    : err.message;

  res.status(statusCode).json({
    success: false,
    message: message,
    error: 'INTERNAL_SERVER_ERROR'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Start notification scheduler
  notificationScheduler.start();
  
  // Start assignment reminder cron job
  startAssignmentReminderCron();
  
  // STEP 6: Start class reminder cron job
  startClassReminderCron();
});
