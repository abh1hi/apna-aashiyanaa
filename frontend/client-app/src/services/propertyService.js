import axios from 'axios';
import authService from './authService';

// Use deployed Firebase function URL as default
const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://us-central1-apnaashiyanaa-app.cloudfunctions.net/api';

// Create axios instance with auth header
const apiClient = axios.create({
  baseURL: API_URL,
  // Content-Type will be set by interceptor based on data type
});

// Add Firebase ID token to requests dynamically
apiClient.interceptors.request.use(
  async (config) => {
    const token = await authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Set Content-Type for JSON requests only (not for FormData)
    if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Create a new property with images
 * @param {FormData} formData - Property data including images
 * @returns {Promise<Object>} - Created property
 */
export const createProperty = async (formData) => {
  try {
    // For FormData, axios automatically sets Content-Type with boundary
    // The interceptor will skip setting Content-Type for FormData
    const response = await apiClient.post('/properties', formData, {
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 120000 // 2 minutes timeout for large uploads
    });
    return response.data;
  } catch (error) {
    console.error('Error creating property:', error);
    if (error.response?.data) {
      throw error.response.data;
    }
    if (error.message) {
      throw new Error(error.message);
    }
    throw error;
  }
};

/**
 * Update an existing property
 * @param {String} id - Property ID
 * @param {FormData} formData - Updated property data
 * @returns {Promise<Object>} - Updated property
 */
export const updateProperty = async (id, formData) => {
  try {
    const response = await apiClient.put(`/properties/${id}`, formData);
    return response.data;
  } catch (error) {
    console.error('Error updating property:', error);
    throw error.response?.data || error;
  }
};

/**
 * Upload images to existing property
 * @param {String} propertyId - Property ID
 * @param {Array<File>} images - Array of image files
 * @returns {Promise<Object>} - Upload result
 */
export const uploadPropertyImages = async (propertyId, images) => {
  try {
    const formData = new FormData();
    images.forEach(image => {
      formData.append('images', image);
    });
    
    const response = await apiClient.post(
      `/properties/${propertyId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error.response?.data || error;
  }
};

/**
 * Delete a specific image from property
 * @param {String} propertyId - Property ID
 * @param {Number} imageIndex - Index of image to delete
 * @returns {Promise<Object>} - Delete result
 */
export const deletePropertyImage = async (propertyId, imageIndex) => {
  try {
    const response = await apiClient.delete(
      `/properties/${propertyId}/images/${imageIndex}`
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get all properties with optional filters
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Array>} - List of properties
 */
export const getProperties = async (filters = {}) => {
  try {
    const response = await apiClient.get('/properties', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get property by ID
 * @param {String} id - Property ID
 * @returns {Promise<Object>} - Property details
 */
export const getPropertyById = async (id) => {
  try {
    const response = await apiClient.get(`/properties/${id}`);
    // Axios wraps the response in response.data
    return response.data;
  } catch (error) {
    console.error('Error fetching property:', error);
    // Extract error message from axios error response
    if (error.response?.data) {
      throw new Error(error.response.data.message || error.response.data.error || 'Failed to fetch property');
    }
    throw error;
  }
};

/**
 * Get user's properties
 * @returns {Promise<Array>} - User's properties
 */
export const getUserProperties = async () => {
  try {
    const response = await apiClient.get('/properties/user/my-properties');
    return response.data;
  } catch (error) {
    console.error('Error fetching user properties:', error);
    throw error.response?.data || error;
  }
};

/**
 * Delete a property
 * @param {String} id - Property ID
 * @returns {Promise<Object>} - Delete result
 */
export const deleteProperty = async (id) => {
  try {
    const response = await apiClient.delete(`/properties/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting property:', error);
    throw error.response?.data || error;
  }
};

/**
 * Search properties
 * @param {Object} searchParams - Search parameters
 * @returns {Promise<Array>} - Search results
 */
export const searchProperties = async (searchParams) => {
  try {
    const response = await apiClient.get('/properties/search', { params: searchParams });
    return response.data;
  } catch (error) {
    console.error('Error searching properties:', error);
    throw error.response?.data || error;
  }
};

export default {
  createProperty,
  updateProperty,
  uploadPropertyImages,
  deletePropertyImage,
  getProperties,
  getPropertyById,
  getUserProperties,
  deleteProperty,
  searchProperties
};
