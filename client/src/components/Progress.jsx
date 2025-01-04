import React from 'react';
import './Progress.css';

function Progress() {
  const progressData = {
    quizzes: [
      { id: 1, title: 'Data Structures', score: 85, date: '2024-01-03' },
      { id: 2, title: 'Algorithms', score: 92, date: '2024-01-04' }
    ],
    studyTime: {
      today: 120, // in minutes
      week: 540,
      month: 2160
    },
    flashcards: {
      mastered: 25,
      learning: 15,
      total: 50
    }
  };

  return (
    <div className="progress-container">
      <h2>Your Progress</h2>

      <div className="progress-grid">
        <div className="progress-card study-time">
          <h3>Study Time</h3>
          <div className="time-stats">
            <div className="time-stat">
              <span className="time-value">{progressData.studyTime.today} min</span>
              <span className="time-label">Today</span>
            </div>
            <div className="time-stat">
              <span className="time-value">{progressData.studyTime.week} min</span>
              <span className="time-label">This Week</span>
            </div>
            <div className="time-stat">
              <span className="time-value">{progressData.studyTime.month} min</span>
              <span className="time-label">This Month</span>
            </div>
          </div>
        </div>

        <div className="progress-card flashcards">
          <h3>Flashcards Progress</h3>
          <div className="flashcard-stats">
            <div className="progress-bar-container">
              <div 
                className="progress-bar"
                style={{ width: `${(progressData.flashcards.mastered / progressData.flashcards.total) * 100}%` }}
              ></div>
            </div>
            <div className="stats-detail">
              <div className="stat">
                <span className="stat-value">{progressData.flashcards.mastered}</span>
                <span className="stat-label">Mastered</span>
              </div>
              <div className="stat">
                <span className="stat-value">{progressData.flashcards.learning}</span>
                <span className="stat-label">Learning</span>
              </div>
              <div className="stat">
                <span className="stat-value">{progressData.flashcards.total}</span>
                <span className="stat-label">Total</span>
              </div>
            </div>
          </div>
        </div>

        <div className="progress-card recent-quizzes">
          <h3>Recent Quiz Scores</h3>
          <div className="quiz-list">
            {progressData.quizzes.map(quiz => (
              <div key={quiz.id} className="quiz-score">
                <div className="quiz-info">
                  <span className="quiz-title">{quiz.title}</span>
                  <span className="quiz-date">{quiz.date}</span>
                </div>
                <div className="score-display">
                  <div className="score-bar" style={{ width: `${quiz.score}%` }}></div>
                  <span className="score-value">{quiz.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Progress;
