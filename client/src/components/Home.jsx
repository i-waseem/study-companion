import React, { useState, useEffect } from 'react';
import { getGeminiResponse, generateMotivationalQuotePrompt } from '../utils/gemini';
import './Home.css';

function Home() {
  const [quote, setQuote] = useState({ text: '', author: '' });
  const [loading, setLoading] = useState(true);

  const fetchNewQuote = async () => {
    try {
      setLoading(true);
      const prompt = generateMotivationalQuotePrompt();
      const response = await getGeminiResponse(prompt);
      
      // Just use the response text directly
      setQuote({
        text: response.trim()
      });
    } catch (error) {
      console.error('Error fetching quote:', error);
      setQuote({
        text: "Every moment is a fresh beginning."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewQuote();
  }, []); // Fetch quote when component mounts

  return (
    <div className="home">
      <div className="welcome-section">
        <h1>Welcome to Study Companion</h1>
        <p>Your personal assistant for academic success</p>
      </div>

      <div className={`quote-section ${loading ? 'loading' : ''}`}>
        <div className="quote-content">
          {loading ? (
            <div className="quote-skeleton">
              <div className="skeleton-text"></div>
            </div>
          ) : (
            <p className="quote-text">{quote.text}</p>
          )}
        </div>
        <button 
          className="refresh-quote" 
          onClick={fetchNewQuote}
          disabled={loading}
          title="Get a new quote"
        >
          <span>↻</span>
          New Quote
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Study Time</h3>
          <p className="stat-value">2 hours today</p>
        </div>
        <div className="stat-card">
          <h3>Quizzes Completed</h3>
          <p className="stat-value">3 this week</p>
        </div>
        <div className="stat-card">
          <h3>Flashcards Mastered</h3>
          <p className="stat-value">25 cards</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
