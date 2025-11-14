<template>
  <div class="bg-surface sticky top-16 z-30 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Mobile filter button -->
      <div class="md:hidden py-3">
        <button @click="openFilterSheet" class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl text-base font-medium text-secondary bg-white hover:bg-gray-50">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L16 11.414V16a1 1 0 01-.293.707l-2 2A1 1 0 0113 18v-6.586L6.293 6.707A1 1 0 016 6V4z"></path></svg>
          Filters
        </button>
      </div>

      <!-- Desktop filters -->
      <div class="hidden md:flex items-center space-x-4 py-4">
        <FilterDropdown :options="typeOptions" v-model="filters.type" placeholder="Property Type" class="w-48" />
        <FilterDropdown :options="priceOptions" v-model="filters.priceRange" placeholder="Price Range" class="w-48" />
        <FilterDropdown :options="bedOptions" v-model="filters.bedrooms" placeholder="Beds" class="w-32" />
        <FilterDropdown :options="bathOptions" v-model="filters.bathrooms" placeholder="Baths" class="w-32" />
        
        <div class="flex-grow"></div>
        
        <FilterDropdown :options="sortOptions" v-model="filters.sortBy" class="w-48" />
        
        <button v-if="hasActiveFilters" @click="clearFilters" class="px-4 py-3 text-sm font-medium text-primary hover:text-blue-700">
          Clear
        </button>
      </div>
    </div>

    <!-- Mobile filter sheet -->
    <BottomSheet :is-open="isFilterSheetOpen" @close="isFilterSheetOpen = false" title="Filters">
      <div class="p-2 space-y-6">
        <FilterDropdown :options="typeOptions" v-model="filters.type" placeholder="Property Type" />
        <FilterDropdown :options="priceOptions" v-model="filters.priceRange" placeholder="Price Range" />
        <FilterDropdown :options="bedOptions" v-model="filters.bedrooms" placeholder="Bedrooms" />
        <FilterDropdown :options="bathOptions" v-model="filters.bathrooms" placeholder="Bathrooms" />

        <div class="pt-6 border-t border-gray-200 flex space-x-4">
          <button @click="clearFilters" class="w-full justify-center px-6 py-3 border border-gray-300 rounded-full text-base font-medium text-secondary bg-white hover:bg-gray-50">Clear</button>
          <button @click="isFilterSheetOpen = false" class="w-full justify-center px-6 py-3 border border-transparent rounded-full text-base font-medium text-on-primary bg-primary hover:bg-blue-700">Apply</button>
        </div>
      </div>
    </BottomSheet>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import BottomSheet from './BottomSheet.vue';
import FilterDropdown from './FilterDropdown.vue';

const emit = defineEmits(['filtersChanged']);

const isFilterSheetOpen = ref(false);
const openFilterSheet = () => isFilterSheetOpen.value = true;

const filters = ref({
  type: '',
  priceRange: '',
  bedrooms: '',
  bathrooms: '',
  sortBy: 'newest'
});

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'sale', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
];
const priceOptions = [
    { value: '', label: 'All Prices' },
    { value: '0-100000', label: 'Under $100K' },
    { value: '100000-300000', label: '$100K - $300K' },
    { value: '300000-500000', label: '$300K - $500K' },
    { value: '500000-1000000', label: '$500K - $1M' },
    { value: '1000000+', label: '$1M+' },
];
const bedOptions = [
    { value: '', label: 'Any Beds' },
    { value: '1', label: '1+ Beds' },
    { value: '2', label: '2+ Beds' },
    { value: '3', label: '3+ Beds' },
    { value: '4', label: '4+ Beds' },
];
const bathOptions = [
    { value: '', label: 'Any Baths' },
    { value: '1', label: '1+ Baths' },
    { value: '2', label: '2+ Baths' },
    { value: '3', label: '3+ Baths' },
];
const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

const hasActiveFilters = computed(() => {
  return filters.value.type || filters.value.priceRange || filters.value.bedrooms || filters.value.bathrooms;
});

const clearFilters = () => {
  filters.value = {
    type: '',
    priceRange: '',
    bedrooms: '',
    bathrooms: '',
    sortBy: 'newest'
  };
};

watch(filters, () => {
  emit('filtersChanged', { ...filters.value });
}, { deep: true });
</script>