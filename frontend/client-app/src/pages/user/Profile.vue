<template>
  <div class="profile-page min-h-screen bg-white">
    <!-- Page Header -->
    <div class="py-12 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Profile</h1>
        <p class="text-gray-600 text-lg">Manage your account details</p>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- Loading State -->
      <div v-if="loading && !user" class="text-center py-20">
        <div class="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading profile...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-20 bg-red-50 p-8 rounded-lg">
        <div class="w-24 h-24 bg-red-100 text-red-600 mx-auto rounded-full flex items-center justify-center mb-6">
            <i class="fas fa-exclamation-triangle text-4xl"></i>
        </div>
        <h3 class="text-2xl font-semibold text-gray-900 mb-2">Failed to load profile</h3>
        <p class="text-gray-600 mb-6 max-w-md mx-auto">{{ error }}</p>
        <button @click="fetchUser" class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
            Retry
        </button>
      </div>
      
      <!-- User Information -->
      <div v-else-if="user" class="bg-white border border-gray-200 rounded-lg shadow-sm p-6 md:p-8">
        <form @submit.prevent="handleSave">
            <div class="flex flex-col md:flex-row items-center md:items-start md:space-x-8">
                <div class="relative mb-6 md:mb-0">
                    <img :src="userAvatar" alt="User avatar" class="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg">
                </div>

                <div class="flex-grow text-center md:text-left">
                    <h2 v-if="!isEditMode" class="text-3xl font-bold text-gray-900 h-[52px]">{{ user.name }}</h2>
                    <input v-else type="text" v-model="editableUser.name" required class="text-3xl font-bold text-gray-900 bg-gray-100 rounded-md p-2 w-full">
                    
                    <p class="text-blue-600 font-medium text-lg mt-1">{{ user.role }}</p>
                    <p class="text-gray-500 text-sm mt-4">Joined on {{ formattedDate(user.createdAt) }}</p>
                </div>

                <div v-if="!isEditMode" class="mt-6 md:mt-0 ml-auto flex-shrink-0">
                    <button @click="toggleEditMode" type="button" class="btn-secondary">
                        <i class="fas fa-pen mr-2"></i>
                        Edit Profile
                    </button>
                </div>
                <div v-else class="flex mt-6 md:mt-0 ml-auto space-x-2 flex-shrink-0">
                    <button type="submit" :disabled="loading" class="bg-blue-600 text-white font-semibold py-2 px-5 rounded-md hover:bg-blue-700 disabled:opacity-50">
                        <span v-if="loading">Saving...</span>
                        <span v-else>Save</span>
                    </button>
                    <button @click="handleCancel" type="button" class="btn-secondary">Cancel</button>
                </div>
            </div>
            
            <div v-if="updateError" class="mt-4 text-center bg-red-100 text-red-700 p-3 rounded-md">
                {{ updateError }}
            </div>

            <div class="border-t border-gray-200 my-8"></div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div class="info-item">
                    <label class="info-label">Email Address</label>
                    <p class="info-value">{{ user.email }}</p>
                </div>
                
                <div class="info-item">
                    <label for="mobile" class="info-label">Mobile Number</label>
                    <p v-if="!isEditMode" class="info-value">{{ user.mobile || 'Not Provided' }}</p>
                    <input v-else id="mobile" type="tel" pattern="[0-9]{10}" title="Mobile number must be 10 digits" v-model="editableUser.mobile" required class="mt-1 text-base font-semibold text-gray-800 bg-gray-50 border border-gray-300 rounded-md p-2 w-full">
                </div>

                <div class="info-item">
                    <label for="aadhaar" class="info-label">Aadhaar Number</label>
                    <p v-if="!isEditMode" class="info-value">{{ user.aadhaarNumber || 'Not Provided' }}</p>
                    <input v-else id="aadhaar" type="text" pattern="[0-9]{12}" title="Aadhaar must be 12 digits" v-model="editableUser.aadhaarNumber" class="mt-1 text-base font-semibold text-gray-800 bg-gray-50 border border-gray-300 rounded-md p-2 w-full">
                </div>

                <div class="info-item">
                    <label class="info-label">User ID</label>
                    <p class="info-value text-xs text-gray-500">{{ user._id }}</p>
                </div>
            </div>
        </form>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { user, loading, error } = storeToRefs(authStore)

const isEditMode = ref(false)
const editableUser = ref(null)
const updateError = ref(null)

const userAvatar = computed(() => {
    const name = isEditMode.value && editableUser.value ? editableUser.value.name : user.value?.name;
    return user.value?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${name || 'User'}`
})

const formattedDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

const fetchUser = () => {
    authStore.fetchUser();
}

const toggleEditMode = () => {
  isEditMode.value = true
  editableUser.value = JSON.parse(JSON.stringify(user.value))
  updateError.value = null;
}

const handleCancel = () => {
  isEditMode.value = false
  editableUser.value = null
}

const handleSave = async () => {
  if (editableUser.value) {
    try {
        await authStore.updateUserProfile(editableUser.value)
        isEditMode.value = false
        editableUser.value = null
        fetchUser() 
    } catch (e) {
        console.error("Failed to update profile:", e)
        updateError.value = "Failed to update profile. Please try again."
    }
  }
}

onMounted(() => {
  if (!user.value) {
    fetchUser()
  }
})
</script>

<style scoped>
.btn-secondary {
    @apply bg-gray-100 text-gray-700 font-semibold py-2 px-5 rounded-md transition duration-300 ease-in-out hover:bg-gray-200;
}
.info-item {
  @apply bg-white p-0; /* simplified from gray background to match new design */
}
.info-label {
  @apply block text-xs font-medium text-gray-500 uppercase tracking-wider;
}
.info-value {
  @apply mt-1 text-base font-semibold text-gray-800;
}
</style>