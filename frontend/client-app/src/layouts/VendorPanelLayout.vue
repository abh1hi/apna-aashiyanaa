<template>
  <div class="vendor-panel-layout" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
    <VendorSidebar :is-collapsed="isSidebarCollapsed" @toggle-sidebar="toggleSidebar" />
    <main class="vendor-content">
      <button class="hamburger" @click="toggleSidebar">&#9776;</button>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import VendorSidebar from '../components/VendorSidebar.vue';

const isSidebarCollapsed = ref(false);

function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
}
</script>

<style scoped>
.vendor-panel-layout {
  display: flex;
  transition: margin-left 0.3s ease;
}

.vendor-content {
  flex-grow: 1;
  padding: 2rem;
  transition: margin-left 0.3s ease;
}

.hamburger {
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1000;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

@media (max-width: 768px) {
  .vendor-panel-layout {
    flex-direction: column;
  }

  .vendor-content {
    margin-left: 0;
  }

  .hamburger {
    display: block;
  }

  .sidebar-collapsed .vendor-sidebar {
    transform: translateX(-100%);
  }
}
</style>
