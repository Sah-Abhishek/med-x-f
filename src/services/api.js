import axios from 'axios';
import { API_URL } from '../utils/constants';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important: Send cookies with requests
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add additional headers or logic here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - token expired or invalid
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else if (status === 403) {
        // Forbidden - insufficient permissions
        window.location.href = '/unauthorized';
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
