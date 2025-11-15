<template>
  <div class="profile-page">
    <div v-if="user" class="profile-container">
      <h1 class="profile-title">Your Profile</h1>
      <div class="profile-details">
        <div class="detail-item">
          <span class="detail-label">Name:</span>
          <span class="detail-value">{{ user.name }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Mobile:</span>
          <span class="detail-value">{{ user.mobile }}</span>
        </div>
      </div>
      <button @click="handleSignOut" class="sign-out-button">Sign Out</button>
    </div>
    <div v-else class="loading-container">
      <p>Loading profile...</p>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../../services/authService';

export default {
  name: 'Profile',
  setup() {
    const router = useRouter();
    const user = ref(null);

    onMounted(async () => {
      try {
        // Fetch user data from your backend API
        const userData = await authService.getProfile();
        user.value = userData;
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        // Redirect to login if not authenticated
        router.push('/login');
      }
    });

    const handleSignOut = async () => {
      try {
        await authService.logout();
        router.push('/login');
      } catch (error) {
        console.error('Sign out failed:', error);
      }
    };

    return { user, handleSignOut };
  },
};
</script>

<style scoped>
.profile-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f3f4f6;
}

.profile-container {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.profile-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #1f2937;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
}

.detail-label {
  font-weight: 600;
  color: #4b5563;
}

.detail-value {
  color: #1f2937;
}

.sign-out-button {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background-color: #ef4444;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.sign-out-button:hover {
  background-color: #dc2626;
}

.loading-container {
  font-size: 1.25rem;
  color: #4b5563;
}
</style>
