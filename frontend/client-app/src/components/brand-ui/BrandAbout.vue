<template>
  <div v-if="aboutUs" class="bg-white">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <h2 class="text-3xl font-extrabold tracking-tight text-gray-900 text-center mb-8">
        About Our Brand
      </h2>
      <div class="prose prose-lg max-w-none mx-auto text-gray-600">
        <p>{{ aboutUs }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  aboutUs: String,
});
</script>
