<template>
  <div class="relative min-h-[550px] md:min-h-[650px] flex items-center justify-center text-center px-4 overflow-hidden">
    <!-- Background Image -->
    <div class="absolute inset-0 z-0">
      <img 
        src="https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg" 
        alt="Luxury house background"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-black/50"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 text-white max-w-3xl mx-auto">
      <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-4">
        Find Your Dream Home With Us
      </h1>
      <p class="text-lg md:text-xl text-gray-200 mb-8 max-w-xl mx-auto">
        Discover the finest properties in the most desirable locations. Your next chapter starts here.
      </p>

      <!-- Search Bar -->
      <div class="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg">
        <form @submit.prevent="performSearch" class="flex items-center">
          <div class="relative flex-grow">
            <i class="fas fa-map-marker-alt absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input 
              type="text" 
              v-model="searchQuery.location"
              placeholder="Search by city, address, or zip..." 
              class="w-full pl-12 pr-4 py-3 bg-transparent rounded-full focus:outline-none focus:ring-0 text-gray-800 placeholder-gray-500"
            />
          </div>
          <button type="submit" class="bg-primary text-on-primary font-bold py-3 px-8 rounded-full text-lg transition-transform duration-200 transform hover:scale-105 active:scale-100 flex-shrink-0">
            <i class="fas fa-search sm:hidden"></i>
            <span class="hidden sm:inline">Search</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const searchQuery = ref({
  location: '',
});

const performSearch = () => {
  if (!searchQuery.value.location.trim()) return;
  
  router.push({
    path: '/search',
    query: { location: searchQuery.value.location.trim() },
  });
};
</script>
