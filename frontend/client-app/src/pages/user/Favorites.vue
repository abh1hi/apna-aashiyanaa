<template>
  <div class="favorites-page min-h-screen bg-background text-on-background">

    <!-- Page Header -->
    

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
          <div v-for="i in 3" :key="i" class="bg-surface rounded-xl shadow-md overflow-hidden animate-pulse">
            <div class="h-56 bg-surface-variant"></div>
            <div class="p-5">
              <div class="h-4 bg-surface-variant rounded w-3/4 mb-3"></div>
              <div class="h-4 bg-surface-variant rounded w-1/2 mb-4"></div>
              <div class="h-3 bg-surface-variant rounded w-full mb-2"></div>
              <div class="h-3 bg-surface-variant rounded w-full mb-4"></div>
              <div class="flex justify-between items-center">
                <div class="h-6 bg-surface-variant rounded w-1/4"></div>
                <div class="w-8 h-8 bg-surface-variant rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

      <!-- No Favorites -->
      <div v-else-if="!favorites || favorites.length === 0" class="text-center py-20">
          <div class="w-24 h-24 bg-primary-container text-primary mx-auto rounded-full flex items-center justify-center mb-6">
            <i class="fas fa-heart-broken text-4xl"></i>
          </div>
          <h3 class="text-2xl font-semibold text-on-surface mb-2">No Favorites Yet</h3>
          <p class="text-on-surface-variant mb-6 max-w-md mx-auto">Start exploring and save your favorite properties to see them here.</p>
          <router-link to="/search" class="btn-primary">
            Find Properties
          </router-link>
      </div>

      <!-- Favorites Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
        <PropertyCard 
          v-for="property in favorites" 
          :key="property._id" 
          :property="property" 
        />
      </div>

    </main>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useFavoritesStore } from '@/store/favorites'
import PropertyCard from '@/components/PropertyCard.vue'

const favoriteStore = useFavoritesStore()

const favorites = computed(() => favoriteStore.favorites)
const loading = computed(() => favoriteStore.loading)

onMounted(() => {
  favoriteStore.fetchFavorites()
})
</script>

<style scoped>
.btn-primary {
    @apply bg-primary text-on-primary font-bold py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-0.5;
}
</style>
