<template>
  <div class="md:hidden fixed bottom-0 inset-x-0 z-50 pb-3 pt-2" :style="{ paddingBottom: `calc(env(safe-area-inset-bottom, 0.75rem) + 0.75rem)` }">
    <div class="max-w-sm mx-auto h-16 bg-surface/80 backdrop-blur-sm rounded-full shadow-lg flex justify-around items-center px-2">
      
      <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="nav-item" active-class="active">
        <i :class="item.icon" class="text-xl transition-transform duration-200"></i>
        <span class="text-[10px] font-medium mt-1">{{ item.name }}</span>
      </router-link>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const navItems = ref([
  { name: 'Home', path: '/', icon: 'fas fa-home' },
  { name: 'Explore', path: '/search', icon: 'fas fa-compass' },
  { name: 'Messages', path: '/chat', icon: 'fas fa-comment-dots' },
  { name: 'Alerts', path: '/notifications', icon: 'fas fa-bell' },
  { name: 'Profile', path: '/user/profile', icon: 'fas fa-user' },
]);

</script>

<style scoped>
.nav-item {
  @apply flex flex-col items-center justify-center text-on-surface-variant/70 hover:text-primary transition-all duration-300 w-16 h-full;
}

.nav-item.router-link-exact-active {
  @apply text-primary;
}

.nav-item.router-link-exact-active i {
  @apply scale-110;
}
</style>
