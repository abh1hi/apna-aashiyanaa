import { reactive, toRefs } from 'vue';
import wishlistService from '../services/wishlistService';

const state = reactive({
  wishlist: [],
  loading: false,
  error: null,
});

export function useWishlist() {
  const fetchWishlist = async () => {
    state.loading = true;
    state.error = null;
    try {
      state.wishlist = await wishlistService.getWishlist();
    } catch (err) {
      state.error = 'Failed to fetch wishlist';
      console.error(err);
    } finally {
      state.loading = false;
    }
  };

  const addToWishlist = async (productId) => {
    try {
      const updatedWishlist = await wishlistService.addToWishlist(productId);
      state.wishlist = updatedWishlist;
    } catch (err) {
      console.error('Failed to add to wishlist', err);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const updatedWishlist = await wishlistService.removeFromWishlist(productId);
      state.wishlist = updatedWishlist;
    } catch (err) {
      console.error('Failed to remove from wishlist', err);
    }
  };

  const isProductInWishlist = (productId) => {
    return state.wishlist.some(item => item._id === productId);
  };

  return {
    ...toRefs(state),
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    isProductInWishlist,
  };
}
