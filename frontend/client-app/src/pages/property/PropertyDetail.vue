<template>
  <div class="property-detail-page bg-background min-h-screen">
    
    <!-- Image Gallery -->
    <div class="relative">
      <div class="h-72 md:h-96 bg-surface-variant flex items-center justify-center">
        <img v-if="property && property.images.length" :src="property.images[0]" alt="Primary property image" class="w-full h-full object-cover">
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
                <div class="feature-box"><i class="fas fa-bed text-2xl mb-2"></i><p>{{ property.details.bedrooms }} Beds</p></div>
                <div class="feature-box"><i class="fas fa-bath text-2xl mb-2"></i><p>{{ property.details.bathrooms }} Baths</p></div>
                <div class="feature-box"><i class="fas fa-ruler-combined text-2xl mb-2"></i><p>{{ property.details.area }} sqft</p></div>
                <div class="feature-box"><i class="fas fa-building text-2xl mb-2"></i><p>{{ property.propertyType }}</p></div>
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
            
            <!-- Agent Info -->
            <div class="bg-surface rounded-lg p-5 flex items-center">
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({ id: String })
const route = useRoute()

// This is dummy data. In a real app, you would fetch this from your API.
const property = ref(null)

onMounted(() => {
    // Simulate API call
    setTimeout(() => {
        property.value = {
            _id: props.id,
            title: 'Luxury Villa with a View',
            description: 'A stunning villa located in the heart of the city, offering breathtaking views and modern amenities. This property is perfect for those who appreciate a luxurious lifestyle and want to be close to everything the city has to offer. The spacious living areas and private pool make it an ideal home for families or for entertaining guests.',
            images: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=2874&auto=format&fit=crop'],
            price: 45000000,
            listingType: 'sale',
            propertyType: 'Villa',
            location: { address: '123 Royal Palms, Mumbai, India' },
            details: { bedrooms: 4, bathrooms: 5, area: 4200 },
            amenities: ['Swimming Pool', 'Gymnasium', '24/7 Security', 'Clubhouse', 'Garden', 'Private Parking'],
            agent: {
                name: 'Priya Sharma',
                avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Priya%20Sharma'
            }
        };
    }, 500)
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
