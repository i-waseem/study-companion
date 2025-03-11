const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const app = express();

// Log environment variables (excluding sensitive data)
console.log('Environment check:', {
  port: process.env.PORT,
  hasGeminiKey: !!process.env.GEMINI_API_KEY,
  hasMongoUri: !!process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV
});

// CORS configuration - must be before other middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  if (req.cookies && Object.keys(req.cookies).length > 0) {
    console.log('Cookies:', req.cookies);
  }
  next();
});

// API Routes
const apiRouter = express.Router();
app.use('/api', apiRouter);

// Mount routes on API router
apiRouter.use('/auth', require('./routes/auth'));
apiRouter.use('/quiz', require('./routes/quiz'));
apiRouter.use('/quotes', require('./routes/quotes'));
apiRouter.use('/curriculum', require('./routes/curriculum'));
apiRouter.use('/user', require('./routes/user'));
apiRouter.use('/notifications', require('./routes/notifications'));
apiRouter.use('/achievements', require('./routes/achievements'));

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running properly' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Keep the process running in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Keep the process running in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// MongoDB Connection
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

mongoose.connection.on('error', err => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Schedule inactive user check (every day at midnight)
const { checkInactiveUsers } = require('./controllers/notificationController');
const cron = require('node-cron');
cron.schedule('0 0 * * *', checkInactiveUsers);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Setting up routes...');
  console.log(`Server is running on port ${PORT}`);
});
