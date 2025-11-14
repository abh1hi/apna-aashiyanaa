import { apiClient } from '../config/api';

const API_URL = '/addresses';

const getAddresses = () => {
  return apiClient.get(API_URL);
};

const addAddress = (addressData) => {
  return apiClient.post(API_URL, addressData);
};

const updateAddress = (addressId, addressData) => {
  return apiClient.put(`${API_URL}/${addressId}`, addressData);
};

const deleteAddress = (addressId) => {
  return apiClient.delete(`${API_URL}/${addressId}`);
};

const setDefaultAddress = (addressId) => {
  return apiClient.patch(`${API_URL}/${addressId}/default`);
};

const addressService = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};

export default addressService;
