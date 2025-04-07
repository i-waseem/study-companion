const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Curriculum = require('../models/Curriculum');
const Quiz = require('../models/Quiz');
const { generateQuizQuestions, testGeminiAPI } = require('../services/quiz');

// Debug route to check environment variables
router.get('/debug', auth, async (req, res) => {
  const envVars = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'Set (length: ' + process.env.GEMINI_API_KEY.length + ')' : 'Not set',
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set'
  };
  res.json({ env: envVars });
});

// Test Gemini API connection
router.get('/test-gemini', async (req, res) => {
  try {
    const result = await testGeminiAPI();
    res.json({ success: true, message: result });
  } catch (error) {
    console.error('Gemini API test failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gemini API test failed', 
      error: error.message 
    });
  }
});

// Simple test route
router.post('/test', auth, async (req, res) => {
  try {
    console.log('Starting test API call with API key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash" });
    
    // Simple test prompt
    console.log('Sending test prompt to Gemini...');
    const prompt = {
      contents: [{
        role: 'user',
        parts: [{
          text: "What is 2+2? Answer with just the number."
        }]
      }]
    };
    
    const result = await model.generateContent(prompt);
    console.log('Got response from Gemini');
    const response = await result.response;
    const answer = response.text().trim();
    console.log('Test answer:', answer);
    
    res.json({ answer });
  } catch (error) {
    console.error('Test query error:', error);
    
    // Check if it's an API key error
    if (error.message?.includes('API key not valid')) {
      return res.status(500).json({
        error: 'Invalid API key',
        message: 'The Gemini API key is not valid. Please check your configuration.'
      });
    }
    
    res.status(500).json({ 
      error: error.message,
      details: error.errorDetails || 'No additional details available'
    });
  }
});

// Fallback questions in case AI generation fails
const FALLBACK_QUESTIONS = {
  questions: [
    {
      type: 'multiple_choice',
      question: 'What is the primary purpose of studying this topic?',
      options: [
        'To pass exams',
        'To gain practical knowledge',
        'To understand core concepts',
        'To memorize facts'
      ],
      correctAnswer: 2,
      explanation: 'Understanding core concepts is essential for long-term learning and application.',
      difficulty: 'medium'
    },
    {
      type: 'true_false',
      statement: 'Regular practice is essential for mastering any subject.',
      isTrue: true,
      explanation: 'Consistent practice helps reinforce learning and understanding.',
      difficulty: 'easy'
    }
  ]
};

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'Quiz routes are healthy' });
});

// Validate quiz structure
function validateQuiz(quiz) {
  if (!quiz.questions || !Array.isArray(quiz.questions)) {
    throw new Error('Invalid quiz format: missing questions array');
  }

  return quiz.questions.map(q => {
    // Validate question structure
    if (!q.question || !q.options || !q.correctAnswer || !q.explanation) {
      console.error('Invalid question:', q);
      throw new Error(`Invalid question format: missing required fields`);
    }

    // Validate multiple choice questions
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error('Questions must have exactly 4 options');
    }

    // Validate that correctAnswer is one of the options
    if (!q.options.includes(q.correctAnswer)) {
      throw new Error('Correct answer must be one of the options');
    }

    return {
      ...q,
      type: 'multiple_choice'
    };
  });
}

// Generate quiz based on topic and subtopic
router.post('/generate', auth, async (req, res) => {
  try {
    const { subject, topic, subtopic, count = 10 } = req.body;
    console.log('Quiz generation request:', { subject, topic, subtopic, count });

    if (!subject || !topic || !subtopic) {
      throw new Error('Missing required fields');
    }

    const quiz = await generateQuizQuestions({ subject, topic, subtopic, count });
    console.log('Generated quiz with', quiz.questions ? quiz.questions.length : 0, 'questions');
    
    // Validate quiz structure
    const validatedQuestions = validateQuiz(quiz);
    res.json({ questions: validatedQuestions });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Submit quiz route
router.post('/submit', auth, async (req, res) => {
  try {
    const { subject, topic, subtopic, score, totalQuestions, incorrectAnswers, timeTaken } = req.body;
    const userId = req.user.id;

    // Save quiz results to database
    const result = await Quiz.create({
      user: userId,
      subject,
      topic,
      subtopic,
      score,
      totalQuestions,
      incorrectAnswers,
      timeTaken,
      completedAt: new Date()
    });

    res.json({ success: true, result });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
