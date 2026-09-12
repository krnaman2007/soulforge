import axios from 'axios';

// Get backend URL from environment or use dev / production fallback
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000/api/v1' : 'https://soulforge.onrender.com/api/v1');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('soulforge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry or global errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token might be expired or invalid
      // Only clear if we are not on login/register pages
      const isAuthRoute = window.location.pathname.includes('/login') || window.location.pathname.includes('/signup');
      if (!isAuthRoute) {
        localStorage.removeItem('soulforge_token');
        // We could dispatch a logout action here if we had access to the store, 
        // but it's cleaner to handle it at the slice level or via event listeners.
        // For now, redirecting to login is a fallback:
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
