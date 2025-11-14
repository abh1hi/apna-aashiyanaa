<template>
  <div id="app" class="bg-background text-on-background min-h-screen flex flex-col">
    
    <!-- Desktop Header -->
    <AppHeader class="hidden md:block"/>
    <!-- Mobile Header -->
    <MobileHeader class="md:hidden" />

    <!-- Mobile Off-canvas Sidebar -->
    <MobileSidebar />
    
    <main class="flex-grow pt-16 md:pt-0 pb-20 md:pb-0">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <!-- Desktop Footer -->
    <AppFooter class="hidden md:block"/>
    <!-- Mobile Bottom Navigation -->
    <BottomNavBar class="md:hidden"/>
  </div>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue';
import MobileHeader from '@/components/MobileHeader.vue';
import MobileSidebar from '@/components/MobileSidebar.vue';
import AppFooter from '@/components/AppFooter.vue';
import BottomNavBar from '@/components/BottomNavBar.vue';
</script>

<style>
/* Global styles, including transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
