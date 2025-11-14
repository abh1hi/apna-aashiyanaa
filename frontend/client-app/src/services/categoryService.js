
import { apiClient } from '../config/api';

const getCategories = () => {
  return apiClient.get('/categories');
};

export default {
  getCategories,
};
