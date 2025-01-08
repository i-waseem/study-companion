const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://i-waseem.github.io', 'https://study-companion-app.netlify.app'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);

// Serve static files from the React app if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Basic route for testing
app.get('/api/test', (req, res) => {
  res.json({ message: 'Study Companion API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something broke!' });
});

const port = process.env.PORT || 5000;

// Start server
const server = app.listen(port, '0.0.0.0', () => {
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
