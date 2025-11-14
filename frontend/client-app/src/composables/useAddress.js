import { reactive, toRefs } from 'vue';
import addressService from '../services/addressService';

const state = reactive({
  addresses: [],
  loading: false,
  error: null,
});

export function useAddress() {
  const fetchAddresses = async () => {
    state.loading = true;
    state.error = null;
    try {
      state.addresses = await addressService.getAddresses();
    } catch (err) {
      state.error = 'Failed to fetch addresses';
      console.error(err);
    } finally {
      state.loading = false;
    }
  };

  const saveAddress = async (addressData) => {
    state.loading = true;
    state.error = null;
    try {
      if (addressData._id) {
        state.addresses = await addressService.updateAddress(addressData._id, addressData);
      } else {
        state.addresses = await addressService.addAddress(addressData);
      }
    } catch (err) {
      state.error = 'Failed to save address';
      console.error(err);
      throw err; // Re-throw to be caught in the component
    } finally {
      state.loading = false;
    }
  };

  const removeAddress = async (addressId) => {
    state.loading = true;
    state.error = null;
    try {
      state.addresses = await addressService.deleteAddress(addressId);
    } catch (err) {
      state.error = 'Failed to delete address';
      console.error(err);
    } finally {
      state.loading = false;
    }
  };

  const makeDefaultAddress = async (addressId) => {
    state.loading = true;
    state.error = null;
    try {
      state.addresses = await addressService.setDefaultAddress(addressId);
    } catch (err) {
      state.error = 'Failed to set default address';
      console.error(err);
    } finally {
      state.loading = false;
    }
  };

  return {
    ...toRefs(state),
    fetchAddresses,
    saveAddress,
    removeAddress,
    makeDefaultAddress,
  };
}
