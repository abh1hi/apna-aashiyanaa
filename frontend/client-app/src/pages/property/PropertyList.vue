<template>
  <div class="property-list-page min-h-screen bg-gray-50 font-sans">
    
    <!-- Page Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
        <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Find Your Dream Property</h1>
        <p class="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">Explore our curated list of properties for sale and rent.</p>
      </div>
    </div>

    <!-- Filter Bar -->
    <FilterBar @filtersChanged="handleFiltersChanged" class="sticky top-0 z-10" />

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Loading Skeleton -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="i in 6" :key="i" class="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
          <div class="h-56 bg-gray-300"></div>
          <div class="p-6">
            <div class="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div class="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div class="h-4 bg-gray-300 rounded w-1/4"></div>
          </div>
        </div>
      </div>

      <!-- No Results Found -->
      <div v-else-if="properties.length === 0" class="text-center py-16">
        <div class="inline-block bg-yellow-100 text-yellow-600 p-4 rounded-full">
          <i class="fas fa-exclamation-triangle text-4xl"></i>
        </div>
        <h3 class="mt-6 text-2xl font-bold text-gray-900">No Properties Found</h3>
        <p class="mt-2 text-gray-600">We couldn't find any properties matching your criteria.</p>
        <button 
          @click="clearFilters"
          class="mt-6 btn-primary bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all duration-300"
        >
          <i class="fas fa-sync-alt mr-2"></i> Clear Filters and Retry
        </button>
      </div>

      <!-- Properties Grid -->
      <div v-else>
        <div class="flex items-center justify-between mb-6">
          <p class="text-gray-700 font-semibold">{{ totalProperties }} properties found</p>
          <!-- Add sort options here if needed -->
        </div>
        
        <transition-group name="list" tag="div" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <PropertyCard 
            v-for="property in properties" 
            :key="property._id" 
            :property="property" 
          />
        </transition-group>
      </div>

      <!-- Load More Button -->
      <div 
        v-if="hasMore && !loading" 
        class="text-center mt-12"
      >
        <button 
          @click="loadMore"
          :disabled="loadingMore"
          class="btn-primary text-lg px-8 py-4 rounded-full font-bold transition-all duration-300 transform hover:scale-105"
        >
          <i v-if="loadingMore" class="fas fa-spinner fa-spin mr-2"></i>
          {{ loadingMore ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import PropertyCard from '@/components/PropertyCard.vue'
import FilterBar from '@/components/FilterBar.vue'
import { usePropertyStore } from '@/store/property'

const route = useRoute()
const propertyStore = usePropertyStore()

const loadingMore = ref(false)

const properties = computed(() => propertyStore.properties)
const loading = computed(() => propertyStore.loading)
const hasMore = computed(() => propertyStore.pagination.hasMore)
const totalProperties = computed(() => propertyStore.pagination.totalItems)


const handleFiltersChanged = (newFilters) => {
  propertyStore.setFilters(newFilters)
}

const loadMore = async () => {
  loadingMore.value = true
  await propertyStore.loadMore()
  loadingMore.value = false
}

const clearFilters = () => {
  propertyStore.clearFilters()
}

// Fetch properties on initial load and when filters change
watch(() => route.query, (query) => {
  propertyStore.setFilters({ ...query })
}, { deep: true, immediate: true })

</script>

<style scoped>
.btn-primary {
  @apply bg-blue-600 text-white;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>