
import { apiClient } from '../config/api';

const createOrder = (orderData) => {
  return apiClient.post('/orders', orderData);
};

const getOrderById = (orderId) => {
  return apiClient.get(`/orders/${orderId}`);
};

const getMyOrders = () => {
  return apiClient.get('/orders/myorders');
};

export default {
  createOrder,
  getOrderById,
  getMyOrders,
};
