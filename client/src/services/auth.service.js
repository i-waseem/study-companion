import axios from 'axios';
import api from '../api/config';

class AuthService {
  async register(username, email, password) {
    try {
      console.log('Attempting registration with:', { username, email });
      const response = await api.post('/auth/register', {
        username,
        email,
        password
      });
      
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  }

  async login(email, password) {
    try {
      console.log('Attempting login with:', { email });
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn() {
    return !!this.getToken();
  }
}

export default new AuthService();
