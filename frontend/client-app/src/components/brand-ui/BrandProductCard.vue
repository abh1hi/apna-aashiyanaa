<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
    <router-link :to="`/product/${product._id}`" class="block">
      <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden">
        <img 
          :src="product.images[0]?.url || 'https://placehold.co/400x400/F3F4F6/7C3AED?text=Product'" 
          :alt="product.name" 
          class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        >
      </div>
      <div class="p-4 border-t border-gray-200">
        <h3 class="text-lg font-semibold text-gray-800 truncate">
          {{ product.name }}
        </h3>
        <p class="text-base font-bold text-primary mt-2">
          {{ product.price }} {{ product.currency }}
        </p>
      </div>
    </router-link>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  product: {
    type: Object,
    required: true,
  },
});
</script>
