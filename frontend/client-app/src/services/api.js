import axios from 'axios';
import authService from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token from localStorage
api.interceptors.request.use((config) => {
  const token = authService.getToken(); // Using getToken() from authService
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If a 401 error occurs, log the user out
      authService.logout();
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  loginWithPhone: (idToken) => api.post('/auth/phone', { idToken }),
  register: (userData) => api.post('/auth/register', userData),
  checkAuthMethod: (mobile) => api.post('/auth/check-auth-method', { mobile }),
  loginWithPassword: (mobile, password) => api.post('/auth/login/password', { mobile, password }),
};

// User API (Corrected Paths)
export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
};

// Property API
export const propertyApi = {
  getProperties: (params = {}) => api.get('/properties', { params }),
  getProperty: (id) => api.get(`/properties/${id}`),
  createProperty: (propertyData) => api.post('/properties', propertyData),
  updateProperty: (id, propertyData) => api.put(`/properties/${id}`, propertyData),
  deleteProperty: (id) => api.delete(`/properties/${id}`),
};

export default api;
