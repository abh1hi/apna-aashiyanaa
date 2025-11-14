
import { apiClient } from '../config/api';

const getUsers = () => {
  return apiClient.get('/admin/users');
};

const getAdminProperties = () => {
  return apiClient.get('/admin/properties');
};

const approveProperty = (id) => {
  return apiClient.put(`/admin/properties/${id}/approve`);
};

const rejectProperty = (id) => {
  return apiClient.put(`/admin/properties/${id}/reject`);
};

export default {
  getUsers,
  getAdminProperties,
  approveProperty,
  rejectProperty,
};
