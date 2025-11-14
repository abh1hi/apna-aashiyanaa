<template>
  <div class="bg-surface rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 flex flex-col h-full group">
    <!-- Image Section -->
    <div class="relative overflow-hidden">
      <img :src="property.images[0] || 'https://via.placeholder.com/400x250'" :alt="property.title" class="w-full h-52 object-cover transition-transform duration-500 ease-in-out group-hover:scale-105">
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

      <div class="absolute top-3 left-3 bg-primary/90 px-3 py-1 rounded-full text-xs font-bold text-on-primary uppercase tracking-wider">
        For {{ property.type }}
      </div>
      
      <button @click.stop.prevent="toggleFavorite" class="absolute top-3 right-3 text-white rounded-full p-2.5 transition-all duration-300 ease-in-out" :class="isFavorite ? 'bg-error/90' : 'bg-black/50 hover:bg-error/80'">
        <i class="fas fa-heart transform transition-transform duration-200" :class="isFavorite ? 'scale-110' : 'group-hover:scale-110'"></i>
      </button>

      <div class="absolute bottom-0 left-0 p-4 w-full">
        <h3 class="font-bold text-xl text-white leading-tight truncate">{{ property.title }}</h3>
        <p class="text-sm text-gray-300 flex items-center mt-1">
          <i class="fas fa-map-marker-alt text-xs mr-2"></i>
          <span>{{ property.location.address }}</span>
        </p>
      </div>
    </div>
    
    <!-- Content Section -->
    <div class="p-4 flex-grow flex flex-col">
      <!-- Price -->
      <div class="mb-3">
        <p class="font-extrabold text-2xl text-primary">${{ Number(property.price).toLocaleString() }}</p>
      </div>

      <!-- Key Features -->
      <div class="grid grid-cols-3 gap-2 text-center border-y border-outline py-3 mb-4">
        <div class="feature-item">
          <i class="fas fa-bed text-xl mb-1 text-primary-variant"></i>
          <p class="text-sm font-semibold text-on-surface-variant">{{ property.bedrooms }} beds</p>
        </div>
        <div class="feature-item">
          <i class="fas fa-bath text-xl mb-1 text-primary-variant"></i>
          <p class="text-sm font-semibold text-on-surface-variant">{{ property.bathrooms }} baths</p>
        </div>
        <div class="feature-item">
          <i class="fas fa-ruler-combined text-xl mb-1 text-primary-variant"></i>
          <p class="text-sm font-semibold text-on-surface-variant">{{ property.area }} sqft</p>
        </div>
      </div>
      
      <!-- Agent & Action -->
      <div class="mt-auto flex items-center">
        <div class="flex items-center mr-4">
          <img :src="property.agent.avatar" alt="Agent" class="w-10 h-10 rounded-full mr-3 border-2 border-primary-variant">
          <div>
            <p class="font-semibold text-sm text-on-surface">{{ property.agent.name }}</p>
            <p class="text-xs text-secondary">Listing Agent</p>
          </div>
        </div>
        <button class="ml-auto px-5 py-2.5 rounded-full bg-primary text-on-primary font-bold text-sm shadow-md hover:bg-primary-variant transition-all duration-300 ease-in-out transform hover:scale-105">
          Details
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/store/auth';

const props = defineProps({
  property: {
    type: Object,
    required: true,
  },
});

const authStore = useAuthStore();

// Placeholder for actual favorite logic
const isFavorite = computed(() => props.property.featured); // Example logic

const toggleFavorite = () => {
  if (!authStore.isAuthenticated) {
    alert('Please log in to add favorites');
    return;
  }
  console.log('Toggling favorite for property:', props.property._id);
  // Implement actual favorite toggling logic here
};
</script>

<style scoped>
.feature-item {
  @apply flex flex-col items-center;
}
</style>