<template>
  <header class="fixed top-0 left-0 right-0 z-30 bg-surface/80 backdrop-blur-sm md:hidden shadow-md" style="padding-top: env(safe-area-inset-top); padding-bottom: 0.5rem;">
    <div class="flex items-center justify-between h-16 px-4">
      <!-- Back Button -->
      <button v-if="!isHomePage" @click="$router.back()" class="w-10 h-10 flex items-center justify-center rounded-full text-on-surface">
        <i class="fas fa-arrow-left text-xl"></i>
      </button>
      <!-- Hamburger Button -->
      <button v-else @click="uiStore.toggleSidebar" class="w-10 h-10 flex items-center justify-center rounded-full text-on-surface">
        <i class="fas fa-bars text-xl"></i>
      </button>

      <!-- Page Title -->
      <div class="text-lg font-bold text-primary">
        {{ currentPageTitle }}
      </div>

      <!-- User/Action Button -->
      <div class="w-10 h-10 flex items-center justify-center">
         <router-link v-if="authStore.isAuthenticated" to="/user/profile" class="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden">
             <img :src="authStore.user?.avatar || 'https://via.placeholder.com/150'" class="w-full h-full object-cover">
         </router-link>
         <router-link v-else to="/auth/login" class="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-primary">
            <i class="fas fa-user"></i>
         </router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useUIStore } from '@/store/ui';
import { useAuthStore } from '@/store/auth';

const route = useRoute();
const uiStore = useUIStore();
const authStore = useAuthStore();

const isHomePage = computed(() => route.path === '/');

const currentPageTitle = computed(() => {
  return route.meta.title || 'Apna Aashiyanaa';
});
</script>