<template>
  <div class="home-page bg-background text-on-background">

    <!-- ======================= -->
    <!-- Hero Section -->
    <!-- ======================= -->
    <section class="relative min-h-[75vh] md:min-h-[80vh] flex items-center py-10">
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10"></div>
        <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2940&auto=format&fit=crop');"></div>

        <div class="relative max-w-6xl mx-auto px-4 w-full text-center text-on-primary">
            <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold !leading-tight mb-4">
                Discover Your Perfect Property
            </h1>
            <p class="text-base md:text-xl text-on-primary/90 mb-8 max-w-3xl mx-auto">
                India's most trusted platform to buy, sell, and rent properties with confidence and ease.
            </p>
            
            <!-- Search Component -->
            <div class="max-w-3xl mx-auto bg-surface/20 backdrop-blur-md rounded-xl p-2 md:p-3 shadow-2xl">
                <!-- Search Tabs -->
                <div class="flex justify-center mb-3">
                    <button v-for="type in searchTypes" :key="type"
                            @click="activeSearchType = type"
                            :class="['px-4 md:px-5 py-2 text-xs md:text-sm font-semibold rounded-full transition-all duration-300', {'bg-primary text-on-primary': activeSearchType === type, 'text-on-primary/80': activeSearchType !== type}]">
                        {{ type }}
                    </button>
                </div>
                <!-- Search Input -->
                <div class="flex items-center bg-white rounded-full p-1 md:p-2">
                    <input type="text" placeholder="Search city, locality..." class="flex-grow bg-transparent text-on-surface px-4 text-sm md:text-base focus:outline-none">
                    <button class="bg-primary text-on-primary rounded-full font-semibold flex items-center justify-center transition-all duration-300 w-10 h-10 md:w-auto md:h-auto md:px-6 md:py-3 shrink-0">
                        <i class="fas fa-search md:mr-2"></i>
                        <span class="hidden md:inline">Search</span>
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- ======================= -->
    <!-- How It Works -->
    <!-- ======================= -->
    <section class="py-16 md:py-24 bg-surface">
        <div class="max-w-6xl mx-auto px-4">
            <div class="text-center mb-12">
                <h2 class="text-3xl md:text-4xl font-bold text-on-surface">How It Works</h2>
                <p class="text-on-surface-variant max-w-2xl mx-auto mt-4 px-4 md:px-0">Finding your dream property is now easier than ever. Follow these simple steps.</p>
            </div>
            <div class="grid md:grid-cols-3 gap-8 md:gap-4 text-center">
                <div v-for="step in howItWorks" :key="step.title" class="p-4 md:p-6">
                    <div class="w-16 h-16 md:w-20 md:h-20 bg-primary-container text-primary rounded-full flex items-center justify-center mx-auto mb-5 text-2xl md:text-3xl">
                        <i :class="step.icon"></i>
                    </div>
                    <h3 class="text-xl font-bold text-on-surface mb-2">{{ step.title }}</h3>
                    <p class="text-on-surface-variant text-sm md:text-base">{{ step.description }}</p>
                </div>
            </div>
        </div>
    </section>

    <!-- ======================= -->
    <!-- Featured Properties -->
    <!-- ======================= -->
    <section class="py-16 md:py-24">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-on-surface">Featured Properties</h2>
          <p class="text-on-surface-variant max-w-2xl mx-auto mt-4 px-4 md:px-0">Explore our handpicked selection of premier properties.</p>
        </div>
        
        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="i in 4" :key="i" class="animate-pulse bg-surface-variant h-96 rounded-lg"></div>
        </div>
        
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <PropertyCard v-for="property in featuredProperties" :key="property._id" :property="property" />
        </div>

        <div class="text-center mt-12">
             <router-link to="/search" class="btn-primary text-base">View All Properties</router-link>
        </div>
      </div>
    </section>

    <!-- ======================= -->
    <!-- Explore By Cities -->
    <!-- ======================= -->
    <section class="py-16 md:py-24 bg-surface">
        <div class="max-w-7xl mx-auto px-4">
            <div class="text-center mb-12">
                <h2 class="text-3xl md:text-4xl font-bold text-on-surface">Explore By Cities</h2>
                <p class="text-on-surface-variant max-w-2xl mx-auto mt-4 px-4 md:px-0">Find your next home in one of India's top cities.</p>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div v-for="city in cities" :key="city.name" class="city-card">
                    <img :src="city.image" class="absolute inset-0 w-full h-full object-cover"/>
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div class="relative z-10">
                        <h3 class="text-xl font-bold">{{ city.name }}</h3>
                        <p class="text-sm opacity-90">{{ city.properties }} Properties</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PropertyCard from '@/components/PropertyCard.vue'
import { usePropertyStore } from '@/store/property'

const router = useRouter()
const propertyStore = usePropertyStore()

const activeSearchType = ref('Buy')
const searchTypes = ['Buy', 'Rent', 'Commercial']

const featuredProperties = ref([])
const loading = ref(true)

const howItWorks = [
    { icon: 'fas fa-search', title: 'Search Properties', description: 'Start by searching for properties in your preferred location and budget.'},
    { icon: 'fas fa-file-contract', title: 'View Details & Connect', description: 'Explore property details, view images, and connect with owners or agents directly.'},
    { icon: 'fas fa-home', title: 'Finalize Your Home', description: 'Schedule visits, negotiate terms, and finalize the deal on your new home.'},
]

const cities = [
    { name: 'Mumbai', properties: 1250, image: 'https://images.unsplash.com/photo-1562914259-2c2535b1b4a0?q=80&w=2940&auto=format&fit=crop'},
    { name: 'Delhi', properties: 980, image: 'https://images.unsplash.com/photo-1588133539995-5a4cf1353a4b?q=80&w=2890&auto=format&fit=crop'},
    { name: 'Bangalore', properties: 1500, image: 'https://images.unsplash.com/photo-1593323719018-b223c91f1a23?q=80&w=2960&auto-format&fit=crop'},
    { name: 'Pune', properties: 850, image: 'https://images.unsplash.com/photo-1601752945781-3610de5b5f25?q=80&w=2876&auto=format&fit=crop'}
]

const fetchFeaturedProperties = async () => {
  try {
    loading.value = true
    // Assuming the store action fetches all and we can slice
    await propertyStore.fetchFeaturedProperties() 
    featuredProperties.value = propertyStore.featuredProperties.slice(0, 4)
  } catch (error) {
    console.error('Failed to fetch featured properties:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchFeaturedProperties()
})
</script>

<style scoped>
.btn-primary {
    @apply bg-primary text-on-primary font-bold py-3 px-8 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg;
}

.city-card {
    @apply relative h-48 md:h-64 rounded-xl overflow-hidden p-4 flex flex-col justify-end text-on-primary cursor-pointer;
    @apply transition-transform duration-300 ease-in-out;
}

.city-card:hover {
    @apply transform scale-105;
}

.city-card .absolute.bg-black\/50 {
    @apply bg-gradient-to-t from-black/70 to-transparent;
}

</style>
