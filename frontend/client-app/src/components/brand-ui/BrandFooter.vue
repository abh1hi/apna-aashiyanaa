<template>
  <footer class="bg-gray-900 text-white">
    <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h3 class="text-2xl font-bold">
          {{ storeName || 'Our Brand' }}
        </h3>
        <div v-if="socialLinks" class="flex justify-center space-x-6 mt-6">
          <a v-if="socialLinks.instagram" :href="socialLinks.instagram" target="_blank" rel="noopener noreferrer" class="text-gray-400 hover:text-white transition-colors">
            <span class="sr-only">Instagram</span>
            <!-- You would typically use an SVG icon here -->
            <p>Instagram</p>
          </a>
          <a v-if="socialLinks.facebook" :href="socialLinks.facebook" target="_blank" rel="noopener noreferrer" class="text-gray-400 hover:text-white transition-colors">
            <span class="sr-only">Facebook</span>
            <p>Facebook</p>
          </a>
          <a v-if="socialLinks.twitter" :href="socialLinks.twitter" target="_blank" rel="noopener noreferrer" class="text-gray-400 hover:text-white transition-colors">
            <span class="sr-only">Twitter</span>
            <p>Twitter</p>
          </a>
        </div>
        <p class="mt-8 text-center text-base text-gray-400">
          &copy; {{ new Date().getFullYear() }} {{ storeName }}. All Rights Reserved.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  storeName: String,
  socialLinks: Object,
});
</script>
