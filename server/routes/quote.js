const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const FALLBACK_QUOTES = [
    "Education is not about filling a pail, but lighting a fire.",
    "The beautiful thing about learning is that no one can take it away from you.",
    "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
    "Education is the most powerful weapon which you can use to change the world."
];

// Keep track of the last quote time for each session
const lastQuoteTimes = new Map();
const QUOTE_COOLDOWN_MS = 1000; // 1 second cooldown

router.get('/', async (req, res) => {
    try {
        const sessionId = req.ip; // Use IP as session identifier
        const now = Date.now();
        const lastQuoteTime = lastQuoteTimes.get(sessionId) || 0;

        // If requesting too quickly, return the same quote
        if (now - lastQuoteTime < QUOTE_COOLDOWN_MS) {
            const randomQuote = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
            return res.json({ quote: randomQuote });
        }

        // Update last quote time
        lastQuoteTimes.set(sessionId, now);

        // Only proceed with Gemini if we have an API key
        if (!process.env.GEMINI_API_KEY) {
            console.warn('No Gemini API key found, using fallback quote');
            const randomQuote = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
            return res.json({ quote: randomQuote });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `Generate an inspiring and motivational quote about learning, education, or personal growth. 
        The quote should be concise (1-2 sentences) and impactful. 
        Return just the quote text without attribution.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const quote = response.text().trim();

        res.json({ quote });
    } catch (error) {
        console.error('Error generating quote:', error);
        const randomQuote = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
        res.json({ quote: randomQuote });
    }
});

module.exports = router;
