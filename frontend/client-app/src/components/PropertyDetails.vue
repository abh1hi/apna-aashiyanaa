<template>
  <div v-if="property" class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight">{{ property.name }}</h1>
      <p class="mt-2 text-lg text-secondary flex items-center">
        <i class="fas fa-map-marker-alt w-5 mr-2"></i>
        {{ property.location }}
      </p>
    </div>

    <!-- Image Gallery -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-10 h-[500px]">
      <div class="relative rounded-2xl overflow-hidden h-full">
        <img :src="property.images[0]?.url" class="w-full h-full object-cover"/>
      </div>
      <div class="hidden md:grid grid-cols-2 gap-4 h-full">
        <img v-for="(image, index) in property.images.slice(1, 5)" :key="index" :src="image.url" class="w-full h-full object-cover rounded-xl"/>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div class="lg:col-span-2">
        <!-- Property Info -->
        <div class="flex justify-between items-start mb-8">
          <div>
            <p class="text-2xl font-bold text-on-surface">${{ property.price.toLocaleString() }}</p>
            <p class="text-base text-secondary">Estimated Mortgage: ${{ (property.price * 0.005).toLocaleString() }}/mo</p>
          </div>
          <div :class="property.type === 'sale' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'" class="px-4 py-2 rounded-full text-base font-semibold">
            For {{ property.type }}
          </div>
        </div>

        <!-- Key Features -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center my-8 p-6 bg-surface-variant rounded-2xl">
          <div class="space-y-2"><i class="fas fa-bed text-primary text-2xl"></i><p class="font-semibold">{{ property.bedrooms }} Beds</p></div>
          <div class="space-y-2"><i class="fas fa-bath text-primary text-2xl"></i><p class="font-semibold">{{ property.bathrooms }} Baths</p></div>
          <div class="space-y-2"><i class="fas fa-ruler-combined text-primary text-2xl"></i><p class="font-semibold">{{ property.area }} sqft</p></div>
          <div class="space-y-2"><i class="fas fa-building text-primary text-2xl"></i><p class="font-semibold">{{ property.propertyType }}</p></div>
        </div>

        <!-- Description -->
        <div class="prose max-w-none text-on-surface">
          <h3 class="font-bold text-2xl mb-4">About this property</h3>
          <p>{{ property.description }}</p>
        </div>

        <!-- Amenities -->
        <div class="mt-10">
          <h3 class="font-bold text-2xl mb-6">Amenities</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div v-for="amenity in property.amenities" :key="amenity" class="flex items-center text-on-surface">
              <i class="fas fa-check-circle text-green-500 w-5 mr-3"></i>
              <span>{{ amenity }}</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Sidebar/Contact -->
      <div class="lg:col-span-1">
        <div class="sticky top-24 bg-surface p-6 rounded-2xl shadow-lg border border-gray-200">
          <h3 class="font-bold text-xl mb-5 text-center">Contact Agent</h3>
          <!-- Agent Info -->
          <div class="flex items-center space-x-4 mb-6">
            <img :src="property.agent.avatar" class="w-16 h-16 rounded-full" />
            <div>
              <p class="font-bold text-on-surface">{{ property.agent.name }}</p>
              <p class="text-sm text-secondary">{{ property.agent.agency }}</p>
            </div>
          </div>
          <!-- Contact Form -->
          <form @submit.prevent="submitInquiry">
            <div class="space-y-4">
              <input type="text" placeholder="Your Name" class="w-full px-4 py-3 bg-surface-variant rounded-lg focus:ring-primary focus:border-primary">
              <input type="email" placeholder="Your Email" class="w-full px-4 py-3 bg-surface-variant rounded-lg focus:ring-primary focus:border-primary">
              <textarea placeholder="Message..." rows="4" class="w-full px-4 py-3 bg-surface-variant rounded-lg focus:ring-primary focus:border-primary"></textarea>
              <button type="submit" class="w-full bg-primary text-on-primary font-bold py-3 rounded-full text-lg transition-transform hover:scale-105">Send Inquiry</button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
  <div v-else class="text-center py-20">
    <p>Loading property details...</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// This would typically come from a Vuex store or an API call based on the route param
const property = ref({
  _id: '123',
  name: 'Modern Villa with Ocean View',
  location: 'Malibu, California',
  price: 4500000,
  type: 'sale',
  bedrooms: 5,
  bathrooms: 6,
  area: 6200,
  propertyType: 'Villa',
  description: 'An architectural masterpiece on the cliffs of Malibu, this stunning villa offers breathtaking panoramic ocean views from every room. Featuring an open-concept layout, infinity pool, and state-of-the-art amenities, this home is the epitome of luxury coastal living.',
  images: [
    { url: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg' },
    { url: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg' },
    { url: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg' },
    { url: 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg' },
    { url: 'https://images.pexels.com/photos/209315/pexels-photo-209315.jpeg' },
  ],
  amenities: ['Infinity Pool', 'Private Cinema', 'Ocean View', 'Gourmet Kitchen', 'Wine Cellar', 'Smart Home System'],
  agent: {
    name: 'Johnathan Smith',
    agency: 'Prestige Properties',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  }
});

const submitInquiry = () => {
  // Handle form submission
  alert('Inquiry sent!');
}

</script>
