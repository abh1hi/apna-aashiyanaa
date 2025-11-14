
import { apiClient } from '../config/api';

const getUserProfile = (id) => {
  return apiClient.get(`/users/${id}`);
};

const updateUserProfile = (id, userData) => {
  return apiClient.put(`/users/${id}`, userData);
};

export default {
  getUserProfile,
  updateUserProfile,
};
