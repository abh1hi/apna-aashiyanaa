
import { apiClient } from '../config/api';

const getCart = () => {
  return apiClient.get('/cart');
};

const addToCart = (itemData) => {
  return apiClient.post('/cart', itemData);
};

const removeFromCart = (itemId) => {
  return apiClient.delete(`/cart/${itemId}`);
};

const updateCartItem = (itemId, quantity) => {
  return apiClient.put(`/cart/${itemId}`, { quantity });
};

const clearCart = () => {
  return apiClient.delete('/cart');
};

export default {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
};