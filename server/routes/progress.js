const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get user's progress for all subjects
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = await Progress.find({ userId });
    res.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get progress for specific subject and topic
router.get('/user/:userId/:subject/:topic', async (req, res) => {
  try {
    const { userId, subject, topic } = req.params;
    const progress = await Progress.findOne({ userId, subject, topic });
    
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }
    
    res.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update quiz results and get AI-generated recommendations
router.post('/quiz-result', async (req, res) => {
  try {
    const { userId, subject, topic, quizResult } = req.body;
    
    // Find or create progress record
    let progress = await Progress.findOne({ userId, subject, topic });
    if (!progress) {
      progress = new Progress({ userId, subject, topic });
    }
    
    // Add quiz result
    progress.quizResults.push(quizResult);
    
    // Update topic progress
    if (!progress.topicProgress.started) {
      progress.topicProgress.started = new Date();
      progress.topicProgress.status = 'in-progress';
    }
    
    // Calculate mastery level based on recent quiz performances
    const recentQuizzes = progress.quizResults.slice(-3);
    const averageScore = recentQuizzes.reduce((acc, quiz) => 
      acc + (quiz.score / quiz.totalQuestions), 0) / recentQuizzes.length;
    
    if (averageScore >= 0.9) progress.topicProgress.masteryLevel = 'master';
    else if (averageScore >= 0.75) progress.topicProgress.masteryLevel = 'advanced';
    else if (averageScore >= 0.6) progress.topicProgress.masteryLevel = 'intermediate';
    else progress.topicProgress.masteryLevel = 'beginner';
    
    // Generate AI recommendations based on quiz performance
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Based on a student's quiz performance in ${subject} (${topic}):
    - Score: ${quizResult.score}/${quizResult.totalQuestions}
    - Incorrect answers: ${JSON.stringify(quizResult.incorrectAnswers)}
    
    Provide 3 specific recommendations for improvement in JSON format:
    {
      "recommendations": [
        {
          "type": "specific_recommendation",
          "reason": "explanation_for_recommendation"
        }
      ]
    }`;
    
    const result = await model.generateContent(prompt);
    const aiRecommendations = JSON.parse(result.response.text());
    
    // Add AI recommendations
    progress.recommendations.push(...aiRecommendations.recommendations);
    
    await progress.save();
    res.json(progress);
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update study time
router.post('/study-time', async (req, res) => {
  try {
    const { userId, subject, topic, duration } = req.body;
    
    let progress = await Progress.findOne({ userId, subject, topic });
    if (!progress) {
      progress = new Progress({ userId, subject, topic });
    }
    
    progress.studyTime.total += duration;
    progress.studyTime.lastStudySession = new Date();
    
    await progress.save();
    res.json(progress);
  } catch (error) {
    console.error('Error updating study time:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
