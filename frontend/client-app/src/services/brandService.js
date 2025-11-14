import axios from 'axios';

const API_URL = '/api/brands';

const getBrandBySlug = (slug) => {
  return axios.get(`${API_URL}/${slug}`);
};

export default {
  getBrandBySlug,
};