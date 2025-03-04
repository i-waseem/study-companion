import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true,
  transformRequest: [(data, headers) => {
    // Log the request data before transformation
    console.log('Request data before transform:', data);
    return JSON.stringify(data);
  }],
  transformResponse: [(data) => {
    // Log the response data after transformation
    console.log('Response data after transform:', data);
    try {
      return JSON.parse(data);
    } catch (error) {
      return data;
    }
  }]
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Log request details
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response details
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Log error details
    console.error('[API Response Error]', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear user data
      localStorage.removeItem('user');
    }

    return Promise.reject(error);
  }
);

export default api;
