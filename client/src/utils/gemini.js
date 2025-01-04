const GEMINI_API_KEY = 'AIzaSyAtRWUwff095kL_SO9YWvCawHjAUdhR0i0';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export async function getGeminiResponse(prompt) {
    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get response from Gemini');
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw error;
    }
}

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
4. Recommended next steps

Format the response in a clear, structured way that can be easily parsed.`;
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
    return `Generate a short, powerful motivational quote specifically for students. The quote should:
1. Be inspiring and encouraging
2. Focus on academic success, personal growth, or learning
3. Be concise (maximum 2 sentences)
4. Be original and not a common, overused quote

Format the response as just the quote text, without any attribution.`;
}
