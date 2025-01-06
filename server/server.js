const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`, req.body);
  next();
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connection successful'))
  .catch(err => console.error('MongoDB connection error:', err));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Study Companion API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);

// Basic route for testing
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Internal server error', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

const port = process.env.PORT || 5000;

// Start server
const server = app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
  console.log(`MongoDB URI: ${process.env.MONGODB_URI}`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Trying to close existing connection...`);
    require('child_process').exec(`npx kill-port ${port}`, (err) => {
      if (err) {
        console.error('Failed to kill process:', err);
      } else {
        console.log(`Successfully killed process on port ${port}`);
        server.listen(port);
      }
    });
  } else {
    console.error('Server error:', error);
  }
});
