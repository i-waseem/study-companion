import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import './Sidebar.css';

function Sidebar({ username }) {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="sidebar">
      <div className="user-info">
        <div className="avatar">
          {getInitials(username)}
        </div>
        <h2>Welcome, {username || 'User'}!</h2>
      </div>
      
      <nav className="nav-menu">
        <Link to="/" className="nav-item">
          Home
        </Link>
        <Link to="/subjects" className="nav-item">
          Subjects
        </Link>
        <Link to="/flashcards" className="nav-item">
          Flashcards
        </Link>
        <Link to="/quiz" className="nav-item">
          Quiz
        </Link>
        <Link to="/progress" className="nav-item">
          Progress
        </Link>
        <Link to="/notes" className="nav-item">
          Notes
        </Link>
        <Link to="/career-guidance" className="nav-item">
          Career Guidance
        </Link>
        <Link to="/feedback" className="nav-item">
          Feedback
        </Link>
      </nav>

      <div className="logout">
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
