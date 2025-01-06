const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI('AIzaSyAtRWUwff095kL_SO9YWvCawHjAUdhR0i0');

router.post('/generate', async (req, res) => {
    try {
        const { subject, course, topic, subtopic } = req.body;
        
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `Generate a multiple choice quiz about ${subtopic} in ${topic} (${course} - ${subject}).

Important: Your response must be ONLY valid JSON in exactly this format:
{
  "questions": [
    {
      "question": "What is X?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0
    }
  ]
}

Requirements:
1. Generate exactly 5 questions
2. Each question must have exactly 4 options
3. correctAnswer must be the index (0-3) of the correct option
4. Questions should be clear and concise
5. DO NOT include any text before or after the JSON
6. DO NOT include any explanations
7. ONLY return the JSON object`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean the response - remove any non-JSON text
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}') + 1;
        const cleanJson = text.slice(jsonStart, jsonEnd);

        const quizData = JSON.parse(cleanJson);

        // Validate quiz data structure
        if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length !== 5) {
            throw new Error('Invalid quiz data format - must have exactly 5 questions');
        }

        // Validate each question
        quizData.questions.forEach((q, i) => {
            if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correctAnswer !== 'number') {
                throw new Error(`Invalid question format at question ${i + 1}`);
            }
        });

        res.json(quizData);
    } catch (error) {
        console.error('Error generating quiz:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
