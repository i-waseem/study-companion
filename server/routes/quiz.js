const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/auth');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get topics for a subject
router.get('/topics/:level/:subject', async (req, res) => {
  try {
    const { level, subject } = req.params;
    
    // Return static topics for Computer Science
    if (subject === 'Computer-Science') {
      res.json([
        {
          name: 'Data Representation',
          subtopics: [
            { name: 'Binary Systems and Hexadecimal', description: 'Learn about binary and hex number systems' },
            { name: 'Data Storage', description: 'Understanding how data is stored in computers' },
            { name: 'Data Transmission', description: 'Learn about data transmission methods' },
            { name: 'Error Checking', description: 'Methods for detecting and correcting errors' }
          ]
        },
        {
          name: 'Computer Architecture',
          subtopics: [
            { name: 'CPU Components', description: 'Understanding the parts of a CPU' },
            { name: 'Memory Systems', description: 'Different types of computer memory' },
            { name: 'Input/Output Devices', description: 'Various I/O devices and their functions' },
            { name: 'Secondary Storage', description: 'Types of secondary storage devices' }
          ]
        },
        {
          name: 'Programming Concepts',
          subtopics: [
            { name: 'Algorithms', description: 'Basic algorithm concepts and design' },
            { name: 'Programming Constructs', description: 'Basic programming structures' },
            { name: 'Arrays and Functions', description: 'Working with arrays and functions' },
            { name: 'Object-Oriented Programming', description: 'OOP concepts and principles' }
          ]
        }
      ]);
    } else {
      res.status(404).json({ error: 'Subject not found' });
    }
  } catch (error) {
    console.error('Error getting topics:', error);
    res.status(500).json({ error: 'Failed to get topics' });
  }
});

// Test endpoint
router.post('/test', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash" });
    const result = await model.generateContent("Say 'The API is working!'");
    const response = await result.response;
    res.json({ answer: response.text() });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ error: 'Test failed', details: error.message });
  }
});

// Generate quiz route
router.post('/generate', auth, async (req, res) => {
  try {
    const { subject, topic, subtopic } = req.body;
    console.log('Generating quiz for:', { subject, topic, subtopic });

    const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash" });

    const prompt = `Create a quiz about ${subtopic} in ${subject} (${topic}).

Generate EXACTLY 5 questions in this format:

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
Make sure each question has all required fields.`;

    // Generate questions using Gemini
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

    res.json({ questions });
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ 
      error: 'Failed to generate quiz',
      details: error.message
    });
  }
});

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'Quiz routes are healthy' });
});

module.exports = router;
