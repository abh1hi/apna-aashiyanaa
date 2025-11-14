<template>
  <div class="bg-gray-50">
    <div class="max-w-7xl mx-auto py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <h2 class="text-3xl font-extrabold tracking-tight text-gray-900 text-center mb-12">
        Our Collection
      </h2>
      <div v-if="products && products.length">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          <BrandProductCard 
            v-for="product in products" 
            :key="product._id" 
            :product="product"
          />
        </div>
      </div>
      <div v-else class="text-center">
        <p class="text-lg text-gray-500">No products to display yet. Check back soon!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import BrandProductCard from './BrandProductCard.vue';

defineProps({
  products: Array,
});
</script>
