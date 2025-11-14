<template>
  <form @submit.prevent="handleSubmit" class="space-y-6 bg-surface p-8 rounded-3xl shadow-lg">
    <MapSelector :initial-center="mapCenter" @location-updated="handleLocationUpdate" class="mb-8" />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField v-model="form.fullName" label="Full Name" required placeholder="John Doe" />
      <InputField v-model="form.phoneNumber" label="Phone Number" required type="tel" placeholder="+1 (555) 555-5555" />
    </div>

    <InputField v-model="form.streetAddress" label="Street Address" required placeholder="123 Main St" />
    <InputField v-model="form.apartment" label="Apartment, suite, etc. (Optional)" placeholder="Apt 4B" />

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <InputField v-model="form.city" label="City" required placeholder="San Francisco" />
      <InputField v-model="form.state" label="State / Province" required placeholder="CA" />
      <InputField v-model="form.postalCode" label="Postal Code" required placeholder="94103" />
    </div>

    <InputField v-model="form.country" label="Country" required placeholder="United States" />

    <div>
      <label for="addressType" class="block text-sm font-medium text-secondary mb-2">Address Type</label>
      <select id="addressType" v-model="form.addressType" class="w-full px-4 py-3 bg-gray-50 border-gray-300 rounded-xl focus:ring-primary focus:border-primary">
        <option>Home</option>
        <option>Work</option>
        <option>Other</option>
      </select>
    </div>

    <div class="flex items-center mt-6">
      <input type="checkbox" v-model="form.isDefault" id="isDefault" class="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary" />
      <label for="isDefault" class="ml-3 block text-base text-secondary">Set as default address</label>
    </div>

    <div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4 pt-6">
      <button type="button" @click="$emit('cancel')" class="w-full sm:w-auto justify-center px-6 py-3 border border-gray-300 rounded-full text-base font-medium text-secondary bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">Cancel</button>
      <button type="submit" class="w-full sm:w-auto inline-flex justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-on-primary bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Save Address</button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import MapSelector from './MapSelector.vue';
import InputField from './InputField.vue';
import { reverseGeocode } from '../utils/geocoding';

const props = defineProps({
  address: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['save', 'cancel']);

const form = ref({});

const mapCenter = computed(() => {
  if (props.address.latitude && props.address.longitude) {
    return [props.address.latitude, props.address.longitude];
  }
  return [51.505, -0.09]; // Default center
});

watch(() => props.address, (newAddress) => {
  form.value = { ...newAddress };
}, { immediate: true, deep: true });

const handleLocationUpdate = async ({ latitude, longitude }) => {
  try {
    const addressDetails = await reverseGeocode(latitude, longitude);
    form.value.streetAddress = `${addressDetails.road || ''} ${addressDetails.house_number || ''}`.trim();
    form.value.city = addressDetails.city || addressDetails.town || addressDetails.village || '';
    form.value.state = addressDetails.state || '';
    form.value.postalCode = addressDetails.postcode || '';
    form.value.country = addressDetails.country || '';
    form.value.latitude = latitude;
    form.value.longitude = longitude;
  } catch (error) {
    console.error('Failed to update address from map:', error);
  }
};

const handleSubmit = () => {
  emit('save', form.value);
};
</script>
