import * as React from 'react';
import api from '../api/config';

export const AuthContext = React.createContext(null);

// Get user data from localStorage on initial load
const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error reading user from localStorage:', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = React.useState(getStoredUser());
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Update localStorage when user state changes
  React.useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const register = async (username, email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Sending registration request...');
      const response = await api.post('/auth/register', {
        username,
        email,
        password
      });
      
      console.log('Registration response:', response.data);
      // Don't set user after registration
      return response.data;
    } catch (err) {
      console.error('Registration error in context:', err);
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Sending login request with:', { email, password: '***' });
      
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      console.log('Login response:', response.data);
      
      if (!response.data.user) {
        throw new Error('No user data received from server');
      }

      // Store user data in state and localStorage
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data.user;
    } catch (err) {
      console.error('Login error in context:', err);
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await api.post('/auth/logout');
      
      // Clear user data
      setUser(null);
      localStorage.removeItem('user');
    } catch (err) {
      console.error('Logout error:', err);
      const errorMessage = err.response?.data?.message || 'Logout failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
