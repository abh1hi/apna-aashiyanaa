
import { apiClient } from '../config/api';

const getProducts = (categoryId = null) => {
  let endpoint = '/products';
  if (categoryId) {
    endpoint += `?category=${categoryId}`;
  }
  return apiClient.get(endpoint);
};

const getProductById = (id) => {
  return apiClient.get(`/products/${id}`);
};

export default {
  getProducts,
  getProductById,
};