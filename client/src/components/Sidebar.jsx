import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="user-info">
        {user ? (
          <>
            <div className="user-avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="user-name">
              Welcome, {user.username}!
            </div>
          </>
        ) : (
          <div className="user-name">Welcome!</div>
        )}
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

      {user && (
        <div className="logout">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
