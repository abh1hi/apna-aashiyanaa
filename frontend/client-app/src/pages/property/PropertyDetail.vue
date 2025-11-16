<template>
  <div class="property-detail-page bg-background min-h-screen">
    
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <i class="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
        <p class="text-on-surface-variant">Loading property details...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <i class="fas fa-exclamation-triangle text-4xl text-error mb-4"></i>
        <p class="text-on-surface-variant">{{ error }}</p>
        <button @click="$router.back()" class="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg">Go Back</button>
      </div>
    </div>

    <!-- Property Content -->
    <template v-else-if="property">
    <!-- Image Gallery -->
    <div class="relative">
      <div class="h-72 md:h-96 bg-surface-variant flex items-center justify-center">
        <img v-if="property.images && property.images.length > 0" :src="property.images[0]" alt="Primary property image" class="w-full h-full object-cover">
        <div v-else class="text-on-surface-variant">Image not available</div>
      </div>
      <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent"></div>

      <!-- Top Bar Actions -->
      <div class="absolute top-0 left-0 w-full flex justify-between items-center p-4 text-on-primary">
        <button @click="$router.back()" class="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center backdrop-blur-sm">
          <i class="fas fa-arrow-left"></i>
        </button>
        <div class="flex space-x-2">
            <button class="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center backdrop-blur-sm">
                <i class="fas fa-share-alt"></i>
            </button>
            <button class="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center backdrop-blur-sm">
                <i class="far fa-heart"></i>
            </button>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 w-full p-4 text-on-primary">
        <h1 class="text-3xl font-bold">{{ property.title }}</h1>
        <p class="text-sm opacity-90"><i class="fas fa-map-marker-alt mr-2"></i>{{ property.location.address }}</p>
      </div>
    </div>

    <!-- Main Content -->
    <main class="-mt-4 bg-background rounded-t-2xl relative z-10 p-4 md:p-6">
        <div class="max-w-4xl mx-auto">

            <!-- Price and Basic Info -->
            <div class="flex justify-between items-center mb-6">
                <p class="text-3xl font-bold text-primary">&#8377;{{ formattedPrice(property.price) }}</p>
                <div class="px-4 py-1.5 rounded-full text-sm font-semibold"
                     :class="property.listingType === 'sale' ? 'bg-secondary-container text-on-secondary-container' : 'bg-tertiary-container text-on-tertiary-container'">
                    For {{ property.listingType }}
                </div>
            </div>

            <!-- Key Features -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-8">
                <div class="feature-box"><i class="fas fa-bed text-2xl mb-2"></i><p>{{ property.bedrooms || 0 }} Beds</p></div>
                <div class="feature-box"><i class="fas fa-bath text-2xl mb-2"></i><p>{{ property.bathrooms || 0 }} Baths</p></div>
                <div class="feature-box"><i class="fas fa-ruler-combined text-2xl mb-2"></i><p>{{ property.area || 0 }} sqft</p></div>
                <div class="feature-box"><i class="fas fa-building text-2xl mb-2"></i><p>{{ property.propertyType || 'N/A' }}</p></div>
            </div>

            <!-- Description -->
            <div class="mb-8">
                <h2 class="text-xl font-bold text-on-surface mb-3">About this property</h2>
                <p class="text-on-surface-variant leading-relaxed">{{ property.description }}</p>
            </div>

            <!-- Amenities -->
            <div class="mb-8">
                <h2 class="text-xl font-bold text-on-surface mb-4">Amenities</h2>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div v-for="amenity in property.amenities" :key="amenity" class="flex items-center text-on-surface-variant">
                        <i class="fas fa-check-circle text-primary mr-3"></i>
                        <span>{{ amenity }}</span>
                    </div>
                </div>
            </div>

            <!-- Location / Map -->
            <div class="mb-8">
                <h2 class="text-xl font-bold text-on-surface mb-4">Location</h2>
                <div class="h-64 bg-surface-variant rounded-lg flex items-center justify-center text-on-surface-variant">
                    Map Placeholder
                </div>
            </div>
            
            <!-- Agent Info (Optional - can be removed if not needed) -->
            <div v-if="property.agent" class="bg-surface rounded-lg p-5 flex items-center">
                <img :src="property.agent.avatar" alt="Agent" class="w-16 h-16 rounded-full mr-5">
                <div>
                    <p class="font-bold text-on-surface">{{ property.agent.name }}</p>
                    <p class="text-sm text-on-surface-variant">Listing Agent</p>
                </div>
                <div class="ml-auto flex space-x-3">
                    <button class="w-12 h-12 bg-primary-container text-primary rounded-full flex items-center justify-center"><i class="fas fa-comment-dots text-xl"></i></button>
                    <button class="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center"><i class="fas fa-phone-alt text-xl"></i></button>
                </div>
            </div>

        </div>
    </main>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import propertyService from '@/services/propertyService'

const props = defineProps({ id: String })
const route = useRoute()

const property = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
    try {
        loading.value = true
        const propertyId = props.id || route.params.id
        
        if (!propertyId) {
            error.value = 'Property ID is required'
            loading.value = false
            return
        }

        // Fetch property from API
        const data = await propertyService.getPropertyById(propertyId)
        
        // Ensure images array exists and is properly formatted
        if (!data.images || !Array.isArray(data.images)) {
            data.images = []
        }
        
        // Ensure location object exists
        if (!data.location) {
            data.location = { address: 'Address not available' }
        }
        
        // Ensure amenities array exists
        if (!data.amenities || !Array.isArray(data.amenities)) {
            data.amenities = []
        }
        
        property.value = data
    } catch (err) {
        console.error('Error fetching property:', err)
        error.value = err.message || 'Failed to load property details'
    } finally {
        loading.value = false
    }
})

const formattedPrice = (price) => {
    if (!price) return ''
    return new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 9 }).format(price)
}

</script>

<style scoped>
.feature-box {
    @apply bg-surface rounded-lg p-4 text-on-surface-variant font-medium;
}
</style>
