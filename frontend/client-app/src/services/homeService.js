
import { apiClient } from '../config/api';

const getHeroBanners = () => {
  return apiClient.get('/home/hero-banners');
};

const getFeaturedCollections = () => {
  return apiClient.get('/home/featured-collections');
};

const getShippingInfo = () => {
  return apiClient.get('/home/shipping-info');
};

export default {
  getHeroBanners,
  getFeaturedCollections,
  getShippingInfo,
};