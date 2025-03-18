import api from '../api/config';

export const getGeminiResponse = async () => {
  try {
    console.log('Requesting quote from server...');
    const response = await api.get('/quotes');
    console.log('Quote response:', {
      isGemini: response.data.isGemini,
      hasQuote: !!response.data.quote,
      hasSource: !!response.data.source,
      error: response.data.error
    });
    return response.data;
  } catch (error) {
    console.error('Error in getGeminiResponse:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return {
      quote: `Error: ${error.message || 'Failed to fetch quote'}`,
      source: 'API Error',
      isGemini: false,
      error: true
    };
  }
};

export function generateCareerGuidancePrompt(answers) {
    return `Based on the following student profile, provide detailed career guidance advice:
    
Interests: ${answers.interests.join(', ')}
Skills: ${answers.skills.join(', ')}
Favorite Subjects: ${answers.subjects.join(', ')}
Preferred Work Style: ${answers.workStyle}
Career Values: ${answers.values.join(', ')}

Please provide:
1. Top 3 recommended career paths that best match this profile
2. For each career path:
   - Why it's a good match
   - Required skills and qualifications
   - Suggested education path
   - Entry-level to advanced positions
   - Industry trends and future prospects
3. Personalized advice for skill development
4. Recommended next steps`;
}

export function generateQuizPrompt(topic, difficulty = 'medium', count = 5) {
    return `Generate ${count} multiple-choice questions about ${topic} at ${difficulty} difficulty level.
    For each question, provide:
    1. The question text
    2. Four answer options (A, B, C, D)
    3. The correct answer
    4. A brief explanation of why it's correct
    
    Format each question in a consistent, easy-to-parse structure.`;
}

export function generateFlashcardsPrompt(topic, count = 10) {
    return `Create ${count} flashcards about ${topic}.
    For each flashcard, provide:
    1. A clear, concise question or term on the front
    2. A comprehensive explanation or definition on the back
    3. Any relevant examples or memory tips
    
    Format each flashcard in a consistent, easy-to-parse structure.`;
}

export function generateStudyNotesPrompt(topic) {
    return `Create comprehensive study notes about ${topic}.
    Include:
    1. Main concepts and definitions
    2. Key points and important details
    3. Examples and applications
    4. Common misconceptions
    5. Practice questions
    
    Format the notes in a clear, structured way that's easy to study from.`;
}

export function generateMotivationalQuotePrompt() {
    return `Generate an inspiring and motivational quote about learning, education, or personal growth. 
    The quote should be concise (1-2 sentences) and impactful. 
    Return just the quote text without attribution.`;
}
