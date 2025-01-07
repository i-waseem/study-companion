import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Register from './components/Register';
import Quiz from './components/Quiz';
import Home from './components/Home';
import Subjects from './components/Subjects';
import Flashcards from './components/Flashcards';
import Progress from './components/Progress';
import Notes from './components/Notes';
import CareerGuidance from './components/CareerGuidance';
import Feedback from './components/Feedback';
import './App.css';

// Protected Route component
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

// Main App content with routing
function AppContent() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
            <Route path="/subjects" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
            <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
            <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
            <Route path="/career-guidance" element={<ProtectedRoute><CareerGuidance /></ProtectedRoute>} />
            <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

// Root App component
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
