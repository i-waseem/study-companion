import React, { useState } from 'react';
import './Feedback.css';

function Feedback() {
  const [feedback, setFeedback] = useState({
    type: 'general',
    message: '',
    rating: 5
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here we'll add the logic to submit feedback to backend
    console.log('Feedback submitted:', feedback);
    // Reset form
    setFeedback({
      type: 'general',
      message: '',
      rating: 5
    });
  };

  return (
    <div className="feedback">
      <h1>Feedback</h1>
      <p className="subtitle">Help us improve your learning experience</p>

      <form onSubmit={handleSubmit} className="feedback-form">
        <div className="form-group">
          <label>Feedback Type</label>
          <select 
            value={feedback.type}
            onChange={(e) => setFeedback({...feedback, type: e.target.value})}
          >
            <option value="general">General</option>
            <option value="bug">Bug Report</option>
            <option value="feature">Feature Request</option>
            <option value="content">Content Improvement</option>
          </select>
        </div>

        <div className="form-group">
          <label>Rating</label>
          <div className="rating-input">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                className={`rating-star ${num <= feedback.rating ? 'active' : ''}`}
                onClick={() => setFeedback({...feedback, rating: num})}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Your Message</label>
          <textarea
            value={feedback.message}
            onChange={(e) => setFeedback({...feedback, message: e.target.value})}
            placeholder="Tell us what you think..."
            rows="5"
          />
        </div>

        <button type="submit" className="submit-btn">
          Submit Feedback
        </button>
      </form>
    </div>
  );
}

export default Feedback;
