const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

// Import routes
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const progressRoutes = require('./routes/progress');
const curriculumRoutes = require('./routes/curriculum');
const quotesRoutes = require('./routes/quotes');
const userRoutes = require('./routes/user');
const notificationsRoutes = require('./routes/notifications');
const achievementsRoutes = require('./routes/achievements');
const flashcardsRoutes = require('./routes/flashcards');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/curriculum', curriculumRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/user', userRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/flashcards', flashcardsRoutes);

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running properly' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
