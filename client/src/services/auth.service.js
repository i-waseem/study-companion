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
      
      // The server is using cookies for auth, not sending tokens in the response
      // So we should only store the user data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
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
      
      // The server is using cookies for auth, not sending tokens in the response
      // So we should only store the user data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn() {
    return !!this.getCurrentUser();
  }
}

export default new AuthService();
