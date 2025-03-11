const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  quizResults: [{
    date: { type: Date, default: Date.now },
    score: Number,
    totalQuestions: Number,
    incorrectAnswers: [{
      question: String,
      userAnswer: String,
      correctAnswer: String,
      explanation: String
    }]
  }],
  topicProgress: {
    started: { type: Date },
    completed: { type: Date },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started'
    },
    masteryLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'master'],
      default: 'beginner'
    }
  },
  studyTime: {
    total: { type: Number, default: 0 }, // in minutes
    lastStudySession: Date
  },
  strengths: [String],
  weaknesses: [String],
  recommendations: [{
    type: String,
    reason: String,
    date: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Compound index for efficient querying
progressSchema.index({ userId: 1, subject: 1, topic: 1 });

module.exports = mongoose.model('Progress', progressSchema);
