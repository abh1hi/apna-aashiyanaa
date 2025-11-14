import { apiClient } from '../config/api';

/**
 * Get all favorites for the current user
 */
const getFavorites = async () => {
  try {
    const data = await apiClient.get('/favorites');
    return data;
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
};

/**
 * Add a property to favorites
 */
const addToFavorites = async (propertyId) => {
  if (!propertyId || propertyId.trim() === '') {
    throw new Error('Property ID is required');
  }

  try {
    const data = await apiClient.post('/favorites', { propertyId: propertyId.trim() });
    return data;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

/**
 * Remove a property from favorites
 */
const removeFromFavorites = async (propertyId) => {
  if (!propertyId || propertyId.trim() === '') {
    throw new Error('Property ID is required');
  }

  try {
    const data = await apiClient.delete(`/favorites/${propertyId.trim()}`);
    return data;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

/**
 * Toggle favorite status for a property
 */
const toggleFavorite = async (propertyId, isFavorite) => {
  if (isFavorite) {
    return await removeFromFavorites(propertyId);
  } else {
    return await addToFavorites(propertyId);
  }
};

export default {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
};
