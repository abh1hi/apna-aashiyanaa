<template>
  <header class="bg-surface/95 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-200 safe-area-padding-top">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">
        <!-- Logo -->
        <router-link to="/" class="flex items-center space-x-2">
          <img src="@/assets/logo.svg" class="h-9 w-auto" alt="AURA Logo">
          <span class="text-2xl font-extrabold tracking-tight text-on-surface">AURA</span>
        </router-link>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-8">
          <router-link v-for="item in navigation" :key="item.name" :to="item.to" class="text-base font-medium text-secondary hover:text-primary transition-colors" active-class="text-primary font-semibold">
            {{ item.name }}
          </router-link>
        </nav>

        <!-- User Profile -->
        <div class="flex items-center">
          <NavUserProfile />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import NavUserProfile from './NavUserProfile.vue';

const navigation = [
  { name: 'Buy', to: '/buy' },
  { name: 'Rent', to: '/rent' },
  { name: 'Sell', to: '/sell' },
  { name: 'Agents', to: '/agents' },
];
</script>

<style scoped>
.safe-area-padding-top {
  padding-top: env(safe-area-inset-top, 0);
}
</style>