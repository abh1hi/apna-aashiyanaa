import { apiClient } from '../config/api';

const API_URL = '/wishlist';

// Get user wishlist
const getWishlist = async () => {
  const response = await apiClient.get(API_URL);
  return response;
};

// Add product to wishlist
const addToWishlist = async (productId) => {
  const response = await apiClient.post(`${API_URL}/add`, { productId });
  return response;
};

// Remove product from wishlist
const removeFromWishlist = async (productId) => {
  const response = await apiClient.delete(`${API_URL}/remove/${productId}`);
  return response;
};

const wishlistService = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};

export default wishlistService;
