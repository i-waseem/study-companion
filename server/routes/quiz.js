const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/auth');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Debug route to check environment
router.get('/debug', auth, async (req, res) => {
  const envVars = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'Set (length: ' + process.env.GEMINI_API_KEY.length + ')' : 'Not set',
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT
  };
  
  res.json({ 
    env: envVars,
    time: new Date().toISOString()
  });
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
    if (!q.type || !q.explanation || !q.difficulty) {
      console.error('Invalid question:', q);
      throw new Error(`Invalid question format: missing required fields`);
    }

    // Validate multiple choice questions
    if (q.type === 'multiple_choice') {
      if (!q.options || q.options.length !== 4) {
        throw new Error('Multiple choice questions must have exactly 4 options');
      }
      if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
        throw new Error('Multiple choice questions must have a valid correctAnswer (0-3)');
      }
    }

    // Validate true/false questions
    if (q.type === 'true_false' && typeof q.isTrue !== 'boolean') {
      throw new Error('True/false questions must have a boolean isTrue field');
    }

    // Validate short answer questions
    if (q.type === 'short_answer' && (!q.keyPoints || !Array.isArray(q.keyPoints))) {
      throw new Error('Short answer questions must have an array of keyPoints');
    }

    return {
      ...q,
      difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty.toLowerCase()) ? q.difficulty.toLowerCase() : 'medium'
    };
  });
}

router.post('/generate', auth, async (req, res) => {
  try {
    const { subject, topic, subtopic } = req.body;
    console.log('Generating quiz for:', { subject, topic, subtopic });

    const model = genAI.getGenerativeModel({ 
      model: "models/gemini-2.0-flash"
    });

    // Generate questions in a more structured format
    const prompt = {
      contents: [{
        role: 'user',
        parts: [{
          text: `Create a quiz about ${subtopic} in ${subject} (${topic}). Return EXACTLY 5 questions in this format:

For multiple choice questions:
Question: [question text]
Options:
A) [option 1]
B) [option 2]
C) [option 3]
D) [option 4]
Correct Answer: [A, B, C, or D]
Explanation: [explanation]
Difficulty: [easy, medium, or hard]

For true/false questions:
Statement: [statement text]
Answer: [True or False]
Explanation: [explanation]
Difficulty: [easy, medium, or hard]

For short answer questions:
Question: [question text]
Key Points:
- [key point 1]
- [key point 2]
- [key point 3]
Explanation: [explanation]
Difficulty: [easy, medium, or hard]

Create 2 multiple choice questions, 2 true/false questions, and 1 short answer question.
Make sure each question has all required fields.`
        }]
      }]
    };

    // Get questions from Gemini
    console.log('Sending request with formatted params:', { subject, topic });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();
    console.log('Raw response:', rawText);

    // Parse the response into structured quiz format
    const questions = [];
    const questionBlocks = rawText.split(/(?=Question:|Statement:)/).filter(block => block.trim());

    for (const block of questionBlocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l);
      
      if (block.includes('Options:')) {
        // Multiple choice question
        const question = lines.find(l => l.startsWith('Question:'))?.replace('Question:', '').trim();
        const options = lines
          .filter(l => /^[A-D]\)/.test(l))
          .map(l => l.replace(/^[A-D]\)\s*/, '').trim());
        const correctAnswer = lines.find(l => l.startsWith('Correct Answer:'))?.replace('Correct Answer:', '').trim();
        const explanation = lines.find(l => l.startsWith('Explanation:'))?.replace('Explanation:', '').trim();
        const difficulty = lines.find(l => l.startsWith('Difficulty:'))?.replace('Difficulty:', '').trim();

        if (!question || !options.length || !correctAnswer || !explanation || !difficulty) {
          console.error('Invalid multiple choice question format:', { question, options, correctAnswer, explanation, difficulty });
          throw new Error('Invalid multiple choice question format');
        }

        questions.push({
          type: 'multiple_choice',
          question,
          options,
          correctAnswer: ['A', 'B', 'C', 'D'].indexOf(correctAnswer),
          explanation,
          difficulty
        });
      } else if (block.includes('Answer:')) {
        // True/false question
        const statement = lines.find(l => l.startsWith('Statement:'))?.replace('Statement:', '').trim();
        const answer = lines.find(l => l.startsWith('Answer:'))?.replace('Answer:', '').trim();
        const explanation = lines.find(l => l.startsWith('Explanation:'))?.replace('Explanation:', '').trim();
        const difficulty = lines.find(l => l.startsWith('Difficulty:'))?.replace('Difficulty:', '').trim();

        if (!statement || !answer || !explanation || !difficulty) {
          console.error('Invalid true/false question format:', { statement, answer, explanation, difficulty });
          throw new Error('Invalid true/false question format');
        }

        questions.push({
          type: 'true_false',
          statement,
          isTrue: answer.toLowerCase().includes('true'),
          explanation,
          difficulty
        });
      } else if (block.includes('Key Points:')) {
        // Short answer question
        const question = lines.find(l => l.startsWith('Question:'))?.replace('Question:', '').trim();
        const keyPointsStart = lines.findIndex(l => l === 'Key Points:');
        const keyPoints = [];
        
        // Collect key points until we hit Explanation or Difficulty
        for (let i = keyPointsStart + 1; i < lines.length; i++) {
          if (lines[i].startsWith('Explanation:') || lines[i].startsWith('Difficulty:')) break;
          if (lines[i].startsWith('-')) {
            keyPoints.push(lines[i].replace('-', '').trim());
          }
        }

        const explanation = lines.find(l => l.startsWith('Explanation:'))?.replace('Explanation:', '').trim();
        const difficulty = lines.find(l => l.startsWith('Difficulty:'))?.replace('Difficulty:', '').trim();

        if (!question || !keyPoints.length || !explanation || !difficulty) {
          console.error('Invalid short answer question format:', { question, keyPoints, explanation, difficulty });
          throw new Error('Invalid short answer question format');
        }

        questions.push({
          type: 'short_answer',
          question,
          keyPoints,
          explanation,
          difficulty
        });
      }
    }

    if (questions.length === 0) {
      throw new Error('No valid questions could be parsed from the response');
    }

    // Validate the generated quiz
    console.log('Generated questions:', questions);
    const validatedQuestions = validateQuiz({ questions });

    res.json({ questions: validatedQuestions });
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ 
      error: 'Failed to generate quiz',
      details: error.message,
      fallback: FALLBACK_QUESTIONS
    });
  }
});

// Submit quiz route
router.post('/submit', auth, require('../controllers/quizController').submitQuiz);

module.exports = router;
