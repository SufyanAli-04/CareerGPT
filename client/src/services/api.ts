import axios from 'axios';
import { errorToast } from '../utils/toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

const isAuthRequest = (url?: string) => {
  if (!url) return false;
  return url.includes('/auth/login') || url.includes('/auth/register');
};

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Keep auth request errors in-page so login/register toasts can be shown.
    if (isAuthRequest(error.config?.url)) {
      return Promise.reject(error);
    }

    // Handle 401 globally — redirect to login for protected endpoints only.
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('careergpt_token');
      localStorage.removeItem('careergpt_user');
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
      return Promise.reject(error);
    }

    // Handle network errors
    if (!error.response) {
      errorToast('Network error - check your connection 🌐');
      return Promise.reject(error);
    }

    // Handle server errors (5xx) - show backend message if available
    if (error.response.status >= 500) {
      const message = error.response?.data?.message || 'Server error - please try again later';
      errorToast(message);
      return Promise.reject(error);
    }

    // For other errors, let the component handle them
    return Promise.reject(error);
  }
);

export default api;
