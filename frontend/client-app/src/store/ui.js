
import { defineStore } from 'pinia';

export const useUIStore = defineStore('ui', {
  state: () => ({
    isSidebarOpen: false,
  }),
  actions: {
    openSidebar() {
      this.isSidebarOpen = true;
    },
    closeSidebar() {
      this.isSidebarOpen = false;
    },
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    },
  },
});
