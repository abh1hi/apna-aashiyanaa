<template>
  <div class="md:hidden">
    <!-- Overlay -->
    <transition name="fade">
      <div v-if="uiStore.isSidebarOpen" @click="uiStore.closeSidebar" class="fixed inset-0 bg-black/60 z-40"></div>
    </transition>

    <!-- Sidebar Panel -->
    <transition name="slide">
      <aside v-if="uiStore.isSidebarOpen" class="fixed top-0 left-0 w-72 h-full bg-surface text-on-surface z-50 flex flex-col">
        <!-- Header -->
        <div class="p-5 border-b border-outline">
          <h2 class="text-2xl font-bold text-primary">Apna Aashiyanaa</h2>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 py-4 px-2 space-y-2">
          <router-link v-for="link in navLinks" :key="link.name" :to="link.path" @click="uiStore.closeSidebar" class="nav-link">
            <i :class="link.icon" class="w-6 text-center"></i>
            <span>{{ link.name }}</span>
          </router-link>
        </nav>

        <!-- Footer / User Profile -->
        <div class="p-4 border-t border-outline">
            <div v-if="!authStore.isAuthenticated" class="flex items-center space-x-3">
                 <router-link to="/auth/login" class="btn-secondary flex-1">Login</router-link>
                 <router-link to="/auth/register" class="btn-primary flex-1">Register</router-link>
            </div>
          <div v-else class="flex items-center">
            <img :src="authStore.user?.avatar || 'https://via.placeholder.com/150'" class="w-10 h-10 rounded-full mr-3">
            <div>
              <p class="font-semibold">{{ authStore.user.name }}</p>
              <a @click="handleLogout" class="text-sm text-primary cursor-pointer">Logout</a>
            </div>
          </div>
        </div>
      </aside>
    </transition>
  </div>
</template>

<script setup>
import { useUIStore } from '@/store/ui';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'vue-router';

const uiStore = useUIStore();
const authStore = useAuthStore();
const router = useRouter();

const navLinks = [
  { name: 'Home', path: '/', icon: 'fas fa-home' },
  { name: 'Buy', path: '/buy', icon: 'fas fa-building' },
  { name: 'Rent', path: '/rent', icon: 'fas fa-key' },
  { name: 'Sell Property', path: '/sell', icon: 'fas fa-plus-circle' },
  { name: 'My Profile', path: '/user/profile', icon: 'fas fa-user' },
  { name: 'My Listings', path: '/user/my-listings', icon: 'fas fa-list' },
  { name: 'Favorites', path: '/user/favorites', icon: 'fas fa-heart' },
  { name: 'Contact Us', path: '/contact', icon: 'fas fa-envelope' },
];

const handleLogout = async () => {
    uiStore.closeSidebar();
    await authStore.logout();
    router.push('/');
}
</script>

<style scoped>
.nav-link {
  @apply flex items-center px-4 py-3 rounded-lg text-on-surface-variant hover:bg-primary-container hover:text-primary font-medium transition-colors duration-200;
}
.nav-link.router-link-exact-active {
  @apply bg-primary text-on-primary;
}

.btn-primary {
    @apply text-center bg-primary text-on-primary font-bold py-2 px-4 rounded-full text-sm;
}

.btn-secondary {
    @apply text-center bg-secondary-container text-on-secondary-container font-bold py-2 px-4 rounded-full text-sm;
}


/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease-in-out;
}
.slide-enter-from, .slide-leave-to {
  transform: translateX(-100%);
}
</style>