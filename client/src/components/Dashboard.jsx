import { useState, useEffect } from 'react';
import './Dashboard.css';

const motivationalQuotes = [
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    quote: "Education is the most powerful weapon which you can use to change the world.",
    author: "Nelson Mandela"
  },
  {
    quote: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  }
];

const successStories = [
  {
    name: "Sarah Chen",
    story: "Started learning to code with no experience, landed a job at Google after 12 months of dedicated study."
  },
  {
    name: "James Rodriguez",
    story: "Balanced full-time work and part-time study, now leads a successful tech startup."
  },
  {
    name: "Priya Patel",
    story: "Self-taught programmer who became a senior software engineer at Microsoft within 3 years."
  }
];

function Dashboard({ user }) {
  const [inspiration, setInspiration] = useState(null);
  const [isQuote, setIsQuote] = useState(true);

  useEffect(() => {
    const randomizeInspiration = () => {
      // Randomly choose between quote and story
      const showQuote = Math.random() > 0.5;
      setIsQuote(showQuote);
      
      if (showQuote) {
        const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
        setInspiration(randomQuote);
      } else {
        const randomStory = successStories[Math.floor(Math.random() * successStories.length)];
        setInspiration(randomStory);
      }
    };

    randomizeInspiration();
  }, []);

  return (
    <div className="dashboard">
      <h1 className="welcome-message">Welcome back, {user?.username}! 👋</h1>
      
      <div className="quote-container">
        {inspiration && isQuote ? (
          <>
            <p className="quote">"{inspiration.quote}"</p>
            <p className="author">- {inspiration.author}</p>
          </>
        ) : inspiration && (
          <>
            <h3 className="story-title">Success Story: {inspiration.name}</h3>
            <p className="story">{inspiration.story}</p>
          </>
        )}
      </div>

      <div className="quick-stats">
        <div className="stat-card">
          <h3>Study Time</h3>
          <p>2 hours today</p>
        </div>
        <div className="stat-card">
          <h3>Quizzes Completed</h3>
          <p>3 this week</p>
        </div>
        <div className="stat-card">
          <h3>Flashcards Mastered</h3>
          <p>25 cards</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
