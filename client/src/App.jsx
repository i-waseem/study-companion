import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthService from './services/auth.service';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import Subjects from './components/Subjects';
import Quiz from './components/Quiz';
import Flashcards from './components/Flashcards';
import Progress from './components/Progress';
import Notes from './components/Notes';
import Feedback from './components/Feedback';
import CareerGuidance from './components/CareerGuidance';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const ProtectedLayout = ({ children }) => {
    if (!AuthService.isAuthenticated()) {
      return <Navigate to="/login" />;
    }

    return (
      <div className="app">
        <Sidebar username={currentUser?.username} />
        <main className="content">
          {children}
        </main>
      </div>
    );
  };

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedLayout>
            <Home />
          </ProtectedLayout>
        } />
        <Route path="/subjects" element={
          <ProtectedLayout>
            <Subjects />
          </ProtectedLayout>
        } />
        <Route path="/quiz" element={
          <ProtectedLayout>
            <Quiz />
          </ProtectedLayout>
        } />
        <Route path="/flashcards" element={
          <ProtectedLayout>
            <Flashcards />
          </ProtectedLayout>
        } />
        <Route path="/progress" element={
          <ProtectedLayout>
            <Progress />
          </ProtectedLayout>
        } />
        <Route path="/notes" element={
          <ProtectedLayout>
            <Notes />
          </ProtectedLayout>
        } />
        <Route path="/career-guidance" element={
          <ProtectedLayout>
            <CareerGuidance />
          </ProtectedLayout>
        } />
        <Route path="/feedback" element={
          <ProtectedLayout>
            <Feedback />
          </ProtectedLayout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
