import { apiClient } from '../config/api';

/**
 * Performs reverse geocoding by calling the secure backend proxy.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<object>} A promise that resolves to the address object.
 */
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const address = await apiClient.post('/geocode/reverse', { latitude, longitude });
    return address;
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    throw new Error('Could not fetch address from location.');
  }
};
