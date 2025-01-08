import axios from 'axios';

const isProduction = window.location.hostname !== 'localhost';

const API_BASE_URL = isProduction
  ? 'https://study-companion-server.onrender.com'  // Your Render.com URL
  : 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

export default api;
