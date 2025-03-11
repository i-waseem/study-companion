import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Progress.css';

const Progress = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/user/progress', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch progress');
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load progress. Please try again.');
      setLoading(false);
    }
  };

  if (loading) return <div className="progress-container">Loading progress...</div>;
  if (error) return <div className="progress-container error">{error}</div>;
  if (!stats) return <div className="progress-container">No progress data available.</div>;

  return (
    <div className="progress-container">
      <h2>Your Study Progress</h2>
      
      <div className="stats-overview">
        <div className="stat-card">
          <h3>Study Streak</h3>
          <p className="stat-value">{stats.streak} days</p>
          <p className="stat-description">Keep it up! 🔥</p>
        </div>
        
        <div className="stat-card">
          <h3>Total Study Time</h3>
          <p className="stat-value">{Math.round(stats.totalStudyHours)} hours</p>
          <p className="stat-description">This week</p>
        </div>

        <div className="stat-card">
          <h3>Average Score</h3>
          <p className="stat-value">{stats.averageScore}%</p>
          <p className="stat-description">Across all quizzes</p>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Quizzes</h3>
        <div className="quiz-history">
          {stats.recentQuizzes.map((quiz, index) => (
            <div key={index} className="quiz-card">
              <div className="quiz-info">
                <h4>{quiz.subject}</h4>
                <p>Score: {quiz.score}%</p>
                <p className="quiz-date">{new Date(quiz.date).toLocaleDateString()}</p>
              </div>
              <div className={`score-indicator ${quiz.score >= 70 ? 'good' : 'needs-improvement'}`}>
                {quiz.score >= 70 ? '🌟' : '📚'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="subject-breakdown">
        <h3>Subject Performance</h3>
        {Object.entries(stats.subjectPerformance).map(([subject, performance]) => (
          <div key={subject} className="subject-card">
            <h4>{subject}</h4>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${performance.averageScore}%` }}
              ></div>
            </div>
            <p>Average: {performance.averageScore}%</p>
            <p>Quizzes taken: {performance.quizzesTaken}</p>
          </div>
        ))}
      </div>

      <div className="recommendations">
        <h3>Study Recommendations</h3>
        <ul>
          {stats.recommendations.map((rec, index) => (
            <li key={index}>
              <span className="recommendation-icon">💡</span>
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Progress;
