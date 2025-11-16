import axios from 'axios';
import authService from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create the base axios instance for our API.
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Use an async interceptor to add the Firebase auth token to every request.
api.interceptors.request.use(async (config) => {
  // Fetch the token asynchronously from our auth service.
  const token = await authService.getToken();
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Interceptor to handle common responses, like a 401 Unauthorized error.
api.interceptors.response.use(
  (response) => response, // Simply return successful responses.
  (error) => {
    // If the server returns a 401, it means the token is invalid or expired.
    if (error.response?.status === 401) {
      // Log the user out from the client-side.
      authService.logout();
      // Force a redirect to the login page.
      window.location.href = '/login';
    }
    // For all other errors, just pass them along.
    return Promise.reject(error);
  }
);

// Export API functions grouped by resource.

export const authApi = {
  loginWithPhone: (idToken) => api.post('/auth/phone', { idToken }),
  register: (userData) => api.post('/auth/register', userData),
};

export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
};

export const propertyApi = {
  getProperties: (params = {}) => api.get('/properties', { params }),
  getProperty: (id) => api.get(`/properties/${id}`),
  createProperty: (propertyData) => api.post('/properties', propertyData),
  updateProperty: (id, propertyData) => api.put(`/properties/${id}`, propertyData),
  deleteProperty: (id) => api.delete(`/properties/${id}`),
};

/**
 * A utility function to transform property data from the backend schema 
 * to a more consistent frontend-friendly format.
 */
export const transformPropertyData = (backendData) => {
  if (!backendData) return {};
  return {
    _id: backendData._id,
    name: backendData.name,
    description: backendData.description,
    price: backendData.variants?.[0]?.price || backendData.price || 0,
    images: backendData.images || [],
    location: backendData.location,
    type: backendData.categories?.[0]?.name || 'For Sale',
    bedrooms: backendData.specifications?.bedrooms,
    bathrooms: backendData.specifications?.bathrooms,
    area: backendData.specifications?.area,
    agent: backendData.user, // The user object associated with the property
    createdAt: backendData.createdAt,
    updatedAt: backendData.updatedAt
  }
}

export default api;
