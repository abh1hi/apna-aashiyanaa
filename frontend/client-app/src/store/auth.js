import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { authApi } from '@/services/api';

// A more modern, composition API-style store
export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('token') || null);

  // Check for stored user on initialization
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser);
    } catch (e) {
      console.error('Error parsing stored user:', e);
      localStorage.removeItem('user');
    }
  }

  // Check authentication based on Firebase auth state and stored user
  const isAuthenticated = computed(() => {
    // Check if we have a user in localStorage and Firebase auth
    return !!user.value;
  });
  const userInitials = computed(() => {
    if (user.value && user.value.name) {
      return user.value.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return 'U';
  });

  function setAuth({ user: userData, token: newToken }) {
    const finalUserData = userData.user || userData;
    user.value = finalUserData;
    token.value = newToken;
    localStorage.setItem('user', JSON.stringify(finalUserData));
    localStorage.setItem('token', newToken);
  }

  function updateUser(userData) {
    user.value = { ...user.value, ...userData };
    localStorage.setItem('user', JSON.stringify(user.value));
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // The favorites store should listen to auth changes or be cleared via an action subscription.
  }

  // Phone auth login/register - handled by authService
  // This store is mainly for state management
  // Actual auth is done through authService.verifyOTPAndLogin/Register

  return {
    user,
    token,
    isAuthenticated,
    userInitials,
    login,
    register,
    logout,
    updateUser,
    setAuth,
  };
});
