<template>
  <header class="bg-surface sticky top-0 z-40 shadow-sm">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        
        <!-- Logo -->
        <div class="flex-shrink-0">
          <router-link to="/" class="flex items-center space-x-2">
            <img src="/media/icon.jpg" alt="Apna Aashiyanaa" class="w-12 h-12 square-full">
            <span class="text-xl font-semibold text-primary">Apna Aashiyanaa</span>
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex md:items-center md:space-x-6">
          <router-link v-for="item in navItems" :key="item.path" :to="item.path" 
            class="font-medium text-on-surface-variant hover:text-primary transition-colors duration-200"
            active-class="text-primary">
            {{ item.name }}
          </router-link>
        </div>

        <!-- Right-side actions -->
        <div class="flex items-center space-x-4">
          
          <!-- User Menu -->
          <div v-if="authStore.isAuthenticated" class="relative">
            <button @click="toggleUserMenu" class="focus:outline-none">
              <img :src="userAvatar" alt="User avatar" class="w-10 h-10 rounded-full object-cover border-2 border-primary-variant">
            </button>

            <!-- User Dropdown -->
            <transition name="fade-down">
              <div v-if="isUserMenuOpen" v-click-outside="closeUserMenu" class="absolute right-0 mt-2 w-56 bg-surface rounded-lg shadow-xl py-2 ring-1 ring-black ring-opacity-5 origin-top-right">
                <div class="px-4 py-3 border-b border-outline">
                  <p class="text-sm font-semibold text-on-surface">{{ authStore.user.name }}</p>
                  <p class="text-xs text-on-surface-variant truncate">{{ authStore.user.email }}</p>
                </div>
                <router-link to="/profile" class="dropdown-item">
                  <i class="fas fa-user-circle w-5 mr-3"></i>My Profile
                </router-link>
                <router-link to="/my-listings" class="dropdown-item">
                  <i class="fas fa-list-alt w-5 mr-3"></i>My Listings
                </router-link>
                <router-link to="/my-favorites" class="dropdown-item">
                  <i class="fas fa-heart w-5 mr-3"></i>My Favorites
                </router-link>
                <div class="border-t border-outline my-1"></div>
                <a href="#" @click.prevent="handleLogout" class="dropdown-item text-error">
                  <i class="fas fa-sign-out-alt w-5 mr-3"></i>Sign Out
                </a>
              </div>
            </transition>
          </div>
          
          <!-- Auth Buttons -->
          <div v-else class="hidden md:flex items-center space-x-2">
            <router-link to="/auth/login" class="btn-secondary">Log In</router-link>
            <router-link to="/auth/register" class="btn-primary">Sign Up</router-link>
          </div>
          
          <!-- Mobile Menu Button -->
          <div class="md:hidden">
            <button @click="uiStore.toggleSidebar" class="focus:outline-none">
                <i class="fas fa-bars text-xl"></i>
            </button>
          </div>

        </div>

      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { useRouter } from 'vue-router';
import vClickOutside from '@/directives/clickOutside';

const authStore = useAuthStore();
const uiStore = useUIStore();
const router = useRouter();

const isUserMenuOpen = ref(false);

const navItems = [
  { name: 'For Sale', path: '/search' },
  { name: 'For Rent', path: '/search?type=rent' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

const userAvatar = computed(() => authStore.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${authStore.user?.name || 'User'}`);

const toggleUserMenu = () => isUserMenuOpen.value = !isUserMenuOpen.value;
const closeUserMenu = () => isUserMenuOpen.value = false;

const handleLogout = () => {
  authStore.logout();
  closeUserMenu();
  router.push('/');
};

</script>

<style scoped>
.dropdown-item {
  @apply flex items-center px-4 py-2 text-sm text-on-surface hover:bg-surface-variant transition-colors duration-150;
}

.fade-down-enter-active, .fade-down-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-down-enter-from, .fade-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.btn-primary {
    @apply bg-primary text-on-primary font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-0.5;
}
.btn-secondary {
    @apply bg-surface-variant text-on-surface-variant font-semibold py-2 px-6 rounded-full transition duration-300 ease-in-out hover:bg-primary-container;
}
</style>