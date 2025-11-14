import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useAuthStore } from './auth';

// Mock API service
const mockFavoriteService = {
  async getFavorites() {
    console.log('Mock API: Fetching favorites');
    const stored = localStorage.getItem('favorites');
    return stored ? JSON.parse(stored) : [];
  },
  async saveFavorites(favorites) {
    console.log('Mock API: Saving favorites');
    localStorage.setItem('favorites', JSON.stringify(favorites));
    return true;
  },
};

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const authStore = useAuthStore();

  const favoritesCount = computed(() => favorites.value.length);
  const isFavorite = (propertyId) => {
    return computed(() => favorites.value.some(fav => fav._id === propertyId));
  };

  async function fetchFavorites() {
    if (!authStore.isAuthenticated) {
      console.log('User not authenticated, skipping favorites fetch.');
      favorites.value = [];
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      favorites.value = await mockFavoriteService.getFavorites();
    } catch (e) {
      error.value = 'Failed to fetch favorites.';
      console.error(e);
    } finally {
      loading.value = false;
    }
  }

  async function toggleFavorite(property) {
    if (!authStore.isAuthenticated) {
      // Optionally, prompt user to log in
      console.log('Authentication required to manage favorites.');
      return;
    }

    const propertyId = property._id;
    const favIndex = favorites.value.findIndex(fav => fav._id === propertyId);

    if (favIndex > -1) {
      // Remove from favorites
      favorites.value.splice(favIndex, 1);
    } else {
      // Add to favorites (storing a simplified property object)
      favorites.value.push({
        _id: property._id,
        name: property.name,
        location: property.location,
        price: property.price,
        images: property.images.slice(0, 1) // Store only the main image
      });
    }

    // Persist changes
    await persistFavorites();
  }

  async function persistFavorites() {
    loading.value = true;
    try {
      await mockFavoriteService.saveFavorites(favorites.value);
    } catch (e) {
      error.value = 'Failed to update favorites.';
      console.error(e);
      // Optionally, revert optimistic update here
    } finally {
      loading.value = false;
    }
  }

  function clearFavorites() {
    favorites.value = [];
    error.value = null;
    // Also clear from persistence
    if (authStore.isAuthenticated) {
        mockFavoriteService.saveFavorites([]);
    }
  }

  // When auth state changes, fetch or clear favorites
  watch(() => authStore.isAuthenticated, (isAuth) => {
    if (isAuth) {
      fetchFavorites();
    } else {
      clearFavorites();
    }
  }, { immediate: true }); // immediate check on store setup

  return {
    favorites,
    loading,
    error,
    favoritesCount,
    isFavorite,
    fetchFavorites,
    toggleFavorite,
    clearFavorites,
  };
});
