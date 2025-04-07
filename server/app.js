const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Basic configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configure cookie settings
app.use((req, res, next) => {
  // Ensure consistent cookie settings across the app
  res.cookie = function(name, value, options = {}) {
    const defaultOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    };
    return express.response.cookie.call(this, name, value, { ...defaultOptions, ...options });
  };

  res.clearCookie = function(name, options = {}) {
    const defaultOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    };
    return express.response.clearCookie.call(this, name, { ...defaultOptions, ...options });
  };

  next();
});

// Debug middleware
app.use((req, res, next) => {
  console.log('=== Incoming Request ===');
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Query:', req.query);
  console.log('=== End Request ===');
  next();
});

// Basic health check endpoint
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Test endpoint
app.get('/test-quote', (req, res) => {
  console.log('Test quote endpoint hit');
  res.json({
    quote: 'Test quote',
    source: 'Test',
    isGemini: false
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const progressRoutes = require('./routes/progress');
const curriculumRoutes = require('./routes/curriculum');
const quotesRoutes = require('./routes/quotes');
const userRoutes = require('./routes/user');
const notificationsRoutes = require('./routes/notifications');
const achievementsRoutes = require('./routes/achievements');
const flashcardSetRoutes = require('./routes/flashcardSets');

// Use routes with /api prefix
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/curriculum', curriculumRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/user', userRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/flashcards', flashcardSetRoutes);

// Debug endpoint to log all registered routes
app._router.stack.forEach(middleware => {
  if (middleware.route) {
    console.log(`Route: ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    middleware.handle.stack.forEach(handler => {
      if (handler.route) {
        console.log(`Route: ${handler.route.path}`);
      }
    });
  }
});

// Test endpoints
app.get('/api/quotes-direct', (req, res) => {
  console.log('Direct quotes endpoint hit');
  res.json({
    quote: 'This is a direct test quote',
    source: 'Direct Test',
    isGemini: false
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Export the app
module.exports = app;
