<template>
  <div class="relative bg-gray-900">
    <div aria-hidden="true" class="absolute inset-0 overflow-hidden">
      <img :src="heroImageUrl || 'https://placehold.co/1600x900/111827/FFFFFF?text=Brand'" :alt="storeName" class="w-full h-full object-center object-cover">
    </div>
    <div aria-hidden="true" class="absolute inset-0 bg-gray-900 opacity-50"></div>

    <div class="relative max-w-3xl mx-auto py-32 px-6 flex flex-col items-center text-center lg:px-0">
      <h1 class="text-4xl font-extrabold tracking-tight text-white lg:text-6xl">{{ storeName }}</h1>
      <p v-if="tagline" class="mt-4 text-xl text-white">{{ tagline }}</p>
      <a href="#" class="mt-8 inline-block bg-white border border-transparent rounded-md py-3 px-8 text-base font-medium text-gray-900 hover:bg-gray-100">Shop Now</a>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  storeName: String,
  tagline: String,
  heroImageUrl: String,
});
</script>
