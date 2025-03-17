const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to generate quiz questions
async function generateQuizQuestions({ subject, topic, subtopic, learningObjectives }) {
  try {
    console.log('Generating quiz questions for:', {
      subject,
      topic,
      subtopic,
      learningObjectives
    });

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Create a quiz about ${subtopic} in ${subject} (${topic}). 
Use these specific learning objectives:
${learningObjectives.map(obj => '- ' + obj).join('\n')}

Return EXACTLY 10 questions in this format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Make sure:
1. Each question tests one of the learning objectives
2. Questions are clear and unambiguous
3. All options are plausible but only one is correct
4. Explanations are concise but informative
5. The response is valid JSON
6. Include exactly 4 options for each question
7. Questions are at O-Level standard
8. Questions test understanding, not just memorization
9. correctAnswer should be the index (0-3) of the correct option
10. Distribute questions evenly across all learning objectives`;

    console.log('Sending prompt to Gemini:', prompt);

    const result = await model.generateContent(prompt);
    console.log('Raw API response:', result);

    const response = await result.response;
    console.log('Processed response:', response);

    const text = response.text();
    console.log('Response text:', text);
    
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsedResponse = JSON.parse(jsonMatch[0]);
      if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
        throw new Error('Invalid response format');
      }

      // Validate question count
      if (parsedResponse.questions.length !== 10) {
        throw new Error(`Expected 10 questions but got ${parsedResponse.questions.length}`);
      }

      return parsedResponse.questions;
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      throw new Error('Failed to parse quiz questions');
    }
  } catch (error) {
    console.error('Error generating quiz questions:', error);
    throw new Error('Failed to generate quiz questions: ' + error.message);
  }
}

// Debug function to test API connection
async function testGeminiAPI() {
  try {
    console.log('Testing Gemini API connection...');
    console.log('API Key present:', !!process.env.GEMINI_API_KEY);
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    console.log('Model configuration:', {
      name: model.model
    });

    const prompt = 'Say "Hello" if you can hear me.';
    console.log('Sending test prompt:', prompt);
    
    const result = await model.generateContent(prompt);
    console.log('Raw API response:', result);
    
    const response = await result.response;
    console.log('Processed response:', response);
    
    const text = response.text();
    console.log('Final text:', text);
    
    return text;
  } catch (error) {
    console.error('Gemini API test failed with error:', {
      name: error.name,
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      errorDetails: error.errorDetails,
      stack: error.stack
    });
    throw error;
  }
}

module.exports = {
  generateQuizQuestions,
  testGeminiAPI
};
