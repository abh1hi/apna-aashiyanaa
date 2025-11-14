<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-200 z-50 md:hidden shadow-[0_-1px_3px_rgba(0,0,0,0.1)]">
    <div class="flex items-center justify-around max-w-md mx-auto">
      <BottomNavItem to="/" label="Home" :active-condition="route => route.path === '/'">
        <template #default="{ isActive }">
          <svg class="w-7 h-7 mb-1" :fill="isActive ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </template>
      </BottomNavItem>

      <BottomNavItem to="/property" label="Search" :active-condition="route => route.path.startsWith('/property')">
        <template #default="{ isActive }">
          <svg class="w-7 h-7 mb-1" :fill="isActive ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </template>
      </BottomNavItem>

      <BottomNavItem to="/user/favorites" label="Favorites" :active-condition="route => route.path === '/user/favorites'">
         <template #default="{ isActive }">
            <div class="relative">
                <svg class="w-7 h-7 mb-1" :fill="isActive ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                <div v-if="favoritesCount > 0" class="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-primary text-on-primary text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {{ favoritesCount }}
                </div>
            </div>
        </template>
      </BottomNavItem>

      <BottomNavItem to="/user/profile" label="Profile" :active-condition="route => route.path.startsWith('/user')">
        <template #default="{ isActive }">
          <svg class="w-7 h-7 mb-1" :fill="isActive ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </template>
      </BottomNavItem>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useFavoritesStore } from '@/store/favorites';
import BottomNavItem from './BottomNavItem.vue';

const favoritesStore = useFavoritesStore();

const favoritesCount = computed(() => favoritesStore.favoritesCount);
</script>
