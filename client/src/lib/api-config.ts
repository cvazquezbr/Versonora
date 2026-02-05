import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || '';

// Add a request interceptor to include the JWT token in all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
