import axios from 'axios'
import { useAuthStore } from '@/store/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

// Auth API - REMOVED LEGACY /auth/login endpoint
export const authApi = {
  loginWithPhone: (idToken) => api.post('/auth/phone', { idToken }),
  register: (userData) => api.post('/auth/register', userData),
  checkAuthMethod: (mobile) => api.post('/auth/check-auth-method', { mobile }),
  loginWithPassword: (mobile, password) => api.post('/auth/login/password', { mobile, password }),
  loginWithOTP: (mobile) => api.post('/auth/login/otp', { mobile }),
  verifyOTP: (userId, otp) => api.post('/auth/verify-otp', { userId, otp }),
  adminLogin: (credentials) => api.post('/auth/admin/login', credentials),
  vendorLogin: (credentials) => api.post('/auth/vendor/login', credentials)
}

// Property API (using existing product endpoints)
export const propertyApi = {
  getProperties: (params = {}) => api.get('/properties', { params }),
  getProperty: (id) => api.get(`/properties/${id}`),
  createProperty: (propertyData) => api.post('/properties', propertyData),
  updateProperty: (id, propertyData) => api.put(`/properties/${id}`, propertyData),
  deleteProperty: (id) => api.delete(`/properties/${id}`)
}

// Favorites API (using cart endpoints)
export const favoritesApi = {
  getFavorites: () => api.get('/cart'),
  addToFavorites: (propertyId) => api.post('/cart/add', { productId: propertyId }),
  removeFromFavorites: (propertyId) => api.delete(`/cart/remove/${propertyId}`)
}

// Categories API
export const categoryApi = {
  getCategories: () => api.get('/categories'),
  createCategory: (categoryData) => api.post('/categories', categoryData)
}

// User API
export const userApi = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (userData) => api.put('/user/profile', userData)
}

// Property data transformation
export const transformPropertyData = (backendData) => {
  return {
    _id: backendData._id,
    name: backendData.name,
    description: backendData.description,
    price: backendData.variants?.[0]?.price || backendData.price,
    images: backendData.images || [],
    location: backendData.location,
    type: backendData.categories?.[0]?.name || 'For Sale',
    bedrooms: backendData.specifications?.bedrooms,
    bathrooms: backendData.specifications?.bathrooms,
    area: backendData.specifications?.area,
    agent: backendData.user,
    createdAt: backendData.createdAt,
    updatedAt: backendData.updatedAt
  }
}

export default api