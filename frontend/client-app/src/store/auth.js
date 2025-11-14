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

  const isAuthenticated = computed(() => !!token.value && !!user.value);
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

  async function login(credentials) {
    const { data } = await authApi.loginWithPassword(credentials.mobile, credentials.password);
    setAuth({ user: data, token: data.token });
    return data;
  }
  
  async function register(userData) {
    const { data } = await authApi.register(userData);
    setAuth({ user: data, token: data.token });
    return data;
  }

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
