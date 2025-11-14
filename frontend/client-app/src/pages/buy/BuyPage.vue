<template>
  <div class="buy-page min-h-screen bg-white">
    <!-- Page Header -->
    <div class="py-12">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Properties for Sale</h1>
        <p class="text-gray-600 text-lg">Find your perfect home to purchase</p>
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
      <div v-else-if="propertiesForSale.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No properties for sale found</h3>
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
          <p class="text-gray-600">{{ propertiesForSale.length }} properties for sale</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <PropertyCard 
            v-for="property in propertiesForSale" 
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

// Filter properties for sale
const propertiesForSale = computed(() => {
  return properties.value.filter(property => 
    property.type?.toLowerCase().includes('sale') || 
    property.type?.toLowerCase() === 'buy' ||
    !property.type // Default to sale if no type specified
  )
})

const handleFiltersChanged = (newFilters) => {
  // Add 'sale' type filter to ensure we only show sale properties
  const saleFilters = { ...newFilters, type: 'sale' }
  propertyStore.setFilters(saleFilters)
}

const loadMore = async () => {
  loadingMore.value = true
  await propertyStore.loadMore()
  loadingMore.value = false
}

const clearFilters = () => {
  propertyStore.clearFilters()
  // Re-apply sale filter after clearing
  propertyStore.setFilters({ type: 'sale' })
}

onMounted(() => {
  // Initialize with sale properties filter
  propertyStore.setFilters({ type: 'sale' })
})
</script>