<template>
  <div class="rent-page min-h-screen bg-white">
    <!-- Page Header -->
    <div class="py-12">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Properties for Rent</h1>
        <p class="text-gray-600 text-lg">Find the perfect rental property</p>
      </div>
    </div>

    <!-- Filter Bar -->
    <FilterBar @filtersChanged="handleFiltersChanged" />

    <!-- Properties Grid -->
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="i in 9" :key="i" class="animate-pulse">
          <div class="bg-gray-200 h-64 rounded-lg"></div>
        </div>
      </div>

      <!-- No Results -->
      <div v-else-if="propertiesForRent.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No rental properties found</h3>
        <p class="text-gray-600 mb-4">Try adjusting your search criteria</p>
        <button 
          @click="clearFilters"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Clear Filters
        </button>
      </div>

      <!-- Properties Grid -->
      <div v-else>
        <div class="flex items-center justify-between mb-6">
          <p class="text-gray-600">{{ propertiesForRent.length }} rental properties available</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <PropertyCard 
            v-for="property in propertiesForRent" 
            :key="property._id" 
            :property="property" 
          />
        </div>
      </div>

      <!-- Load More Button -->
      <div 
        v-if="hasMore && !loading" 
        class="text-center mt-8"
      >
        <button 
          @click="loadMore"
          :disabled="loadingMore"
          class="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loadingMore ? 'Loading...' : 'Load More Properties' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PropertyCard from '@/components/PropertyCard.vue'
import FilterBar from '@/components/FilterBar.vue'
import { usePropertyStore } from '@/store/property'

const propertyStore = usePropertyStore()
const loadingMore = ref(false)

const properties = computed(() => propertyStore.properties)
const loading = computed(() => propertyStore.loading)
const hasMore = computed(() => propertyStore.pagination.hasMore)

// Filter properties for rent
const propertiesForRent = computed(() => {
  return properties.value.filter(property => 
    property.type?.toLowerCase().includes('rent') ||
    property.type?.toLowerCase() === 'rental'
  )
})

const handleFiltersChanged = (newFilters) => {
  // Add 'rent' type filter to ensure we only show rental properties
  const rentFilters = { ...newFilters, type: 'rent' }
  propertyStore.setFilters(rentFilters)
}

const loadMore = async () => {
  loadingMore.value = true
  await propertyStore.loadMore()
  loadingMore.value = false
}

const clearFilters = () => {
  propertyStore.clearFilters()
  // Re-apply rent filter after clearing
  propertyStore.setFilters({ type: 'rent' })
}

onMounted(() => {
  // Initialize with rent properties filter
  propertyStore.setFilters({ type: 'rent' })
})
</script>