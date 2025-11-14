<template>
  <div class="relative">
    <button @click="toggleDropdown" class="flex items-center space-x-2">
      <img v-if="user.avatar" :src="user.avatar" class="w-10 h-10 rounded-full"/>
      <div v-else class="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">
        {{ userInitials }}
      </div>
      <div class="hidden md:block text-left">
        <p class="font-semibold text-sm text-on-surface">{{ user.name }}</p>
        <p class="text-xs text-secondary">{{ user.email }}</p>
      </div>
    </button>

    <!-- Dropdown -->
    <transition name="dropdown">
      <div v-if="isDropdownOpen" class="absolute right-0 mt-3 w-56 bg-surface rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
        <div class="p-3 border-b border-gray-200">
          <p class="font-semibold text-sm text-on-surface truncate">{{ user.name }}</p>
          <p class="text-xs text-secondary truncate">{{ user.email }}</p>
        </div>
        <ul class="py-2">
          <li v-for="item in menuItems" :key="item.label">
            <router-link :to="item.to" class="flex items-center px-4 py-2.5 text-sm text-secondary hover:bg-gray-100">
              <i :class="[item.icon, 'w-5 mr-3']"></i>
              {{ item.label }}
            </router-link>
          </li>
        </ul>
        <div class="p-2 border-t border-gray-200">
          <button @click="handleLogout" class="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg">
            <i class="fas fa-sign-out-alt w-5 mr-3"></i>
            Sign Out
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const isDropdownOpen = ref(false);

const user = computed(() => authStore.user);
const userInitials = computed(() => 
  (user.value?.name || '').split(' ').map(n => n[0]).join('')
);

const menuItems = [
  { label: 'My Profile', to: '/user/profile', icon: 'fas fa-user-circle' },
  { label: 'My Listings', to: '/user/my-listings', icon: 'fas fa-list-alt' },
  { label: 'Add Property', to: '/property/add', icon: 'fas fa-plus-circle' },
  { label: 'Favorites', to: '/user/favorites', icon: 'fas fa-heart' },
];

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const handleLogout = () => {
  authStore.logout();
  isDropdownOpen.value = false;
  router.push('/auth/login');
};
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.25s ease-out;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}
</style>