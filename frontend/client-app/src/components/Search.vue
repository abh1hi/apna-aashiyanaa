<template>
  <div class="flex h-[calc(100vh-80px)]">
    <!-- Filters Sidebar -->
    <aside class="w-1/3 max-w-sm p-6 bg-surface border-r border-gray-200 overflow-y-auto">
      <h2 class="text-2xl font-bold mb-6">Search Filters</h2>
      
      <!-- Search by location -->
      <div class="mb-6">
        <label class="block text-sm font-medium mb-2">Location</label>
        <div class="relative">
          <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input type="text" placeholder="City, Neighborhood..." class="w-full pl-10 pr-4 py-2 bg-surface-variant rounded-lg focus:ring-primary focus:border-primary">
        </div>
      </div>
      
      <!-- Property Type -->
      <div class="mb-6">
        <label class="block text-sm font-medium mb-2">Property Type</label>
        <div class="grid grid-cols-2 gap-2">
          <button class="px-4 py-2 text-sm rounded-lg border border-gray-300">House</button>
          <button class="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-primary text-on-primary">Apartment</button>
          <button class="px-4 py-2 text-sm rounded-lg border border-gray-300">Villa</button>
          <button class="px-4 py-2 text-sm rounded-lg border border-gray-300">Land</button>
        </div>
      </div>
      
      <!-- Price Range -->
      <div class="mb-6">
        <label class="block text-sm font-medium mb-2">Price Range</label>
        <PriceSlider v-model="priceRange" :min="0" :max="5000000" :step="10000"/>
      </div>
      
      <!-- Beds & Baths -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label class="block text-sm font-medium mb-2">Beds</label>
          <select class="w-full bg-surface-variant rounded-lg border-gray-300">
            <option>Any</option><option>1+</option><option>2+</option><option>3+</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Baths</label>
          <select class="w-full bg-surface-variant rounded-lg border-gray-300">
            <option>Any</option><option>1+</option><option>2+</option><option>3+</option>
          </select>
        </div>
      </div>
      
      <!-- Apply Filters -->
      <button class="w-full bg-primary text-on-primary font-bold py-3 rounded-full text-lg transition-transform hover:scale-105">Apply Filters</button>

    </aside>
    
    <!-- Map and Listings -->
    <main class="w-2/3 flex flex-col">
      <!-- Google Map -->
      <div class="h-1/2 bg-gray-200">
        <!-- Replace with actual map component -->
        <div class="w-full h-full flex items-center justify-center text-gray-500">Map Placeholder</div>
      </div>
      
      <!-- Listings -->
      <div class="flex-1 p-6 overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">3 Properties Found</h3>
          <div>
            <label class="text-sm mr-2">Sort by:</label>
            <select class="rounded-lg border-gray-300 text-sm">
              <option>Newest</option>
              <option>Price (Low-High)</option>
              <option>Price (High-Low)</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PropertyCard v-for="p in properties" :key="p._id" :property="p"/>
        </div>
        <!-- Pagination -->
        <div class="flex justify-center mt-8">
          <nav class="inline-flex rounded-md shadow">
            <a href="#" class="px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">Prev</a>
            <a href="#" class="px-4 py-2 border border-gray-300 bg-primary text-white text-sm font-medium">1</a>
            <a href="#" class="px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">2</a>
            <a href="#" class="px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">Next</a>
          </nav>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import PropertyCard from './PropertyCard.vue';
import PriceSlider from './PriceSlider.vue';

const priceRange = ref({ min: 500000, max: 2500000 });

const properties = ref([
  {
    _id: '1',
    name: 'Downtown Apartment',
    location: 'Miami, FL',
    price: 1200000,
    type: 'sale',
    bedrooms: 2,
    bathrooms: 2,
    area: 1500,
    images: [{ url: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg' }]
  },
  // ... more properties
]);

</script>
