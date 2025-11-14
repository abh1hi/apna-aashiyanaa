<template>
  <div class="edit-profile-page min-h-screen bg-background text-on-background">
    
    <!-- Page Header -->
    <div class="sticky top-0 z-30 bg-background/80 backdrop-blur-sm shadow-sm">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 class="text-2xl font-bold text-on-surface">Edit Profile</h1>
            <router-link to="/user/profile" class="text-primary font-semibold hover:underline">
              Cancel
            </router-link>
        </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      <form @submit.prevent="updateProfile" class="bg-surface rounded-xl shadow-md p-6 md:p-8">
        <div class="flex flex-col items-center mb-8">
          <div class="relative mb-4">
            <img :src="avatarPreview || userAvatar" alt="User avatar" class="w-32 h-32 rounded-full object-cover border-4 border-primary-variant">
            <label for="avatar-upload" class="absolute bottom-0 right-0 w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-dark transition">
              <i class="fas fa-camera"></i>
              <input type="file" id="avatar-upload" @change="handleAvatarChange" class="hidden" accept="image/*">
            </label>
          </div>
          <p class="text-on-surface-variant text-sm">Click the camera to change your avatar</p>
        </div>

        <div class="space-y-6">
          <InputField 
            id="name"
            label="Full Name"
            v-model="formData.name"
            :error="v$.name.$error ? v$.name.$errors[0].$message : ''"
            placeholder="Enter your full name"
          />

          <InputField 
            id="mobile"
            label="Mobile Number"
            type="tel"
            v-model="formData.mobile"
            :error="v$.mobile.$error ? v$.mobile.$errors[0].$message : ''"
            placeholder="Enter your mobile number"
          />
        </div>

        <div class="border-t border-outline my-8"></div>

        <div class="flex justify-end items-center space-x-4">
          <router-link to="/user/profile" class="btn-secondary">Cancel</router-link>
          <button type="submit" :disabled="isSubmitting" class="btn-primary">
            <span v-if="isSubmitting">
              <i class="fas fa-spinner fa-spin mr-2"></i>Saving...
            </span>
            <span v-else>Save Changes</span>
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useVuelidate } from '@vuelidate/core'
import { required, minLength, helpers } from '@vuelidate/validators'
import InputField from '@/components/InputField.vue'

const authStore = useAuthStore()
const router = useRouter()

const user = computed(() => authStore.user)

const formData = reactive({
  name: '',
  mobile: '',
  avatar: null
})

const avatarPreview = ref(null)
const isSubmitting = ref(false)

const rules = {
  name: { required: helpers.withMessage('Full name is required', required), minLength: minLength(3) },
  mobile: { required: helpers.withMessage('Mobile number is required', required) }
}

const v$ = useVuelidate(rules, formData)

const userAvatar = computed(() => user.value?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.value?.name || 'User'}`)

const handleAvatarChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    formData.avatar = file
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const updateProfile = async () => {
  v$.value.$touch()
  if (v$.value.$invalid) return

  isSubmitting.value = true
  try {
    await authStore.updateProfile(formData)
    router.push('/user/profile')
  } catch (error) {
    console.error('Failed to update profile:', error)
    // Show an error message to the user
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  if (user.value) {
    formData.name = user.value.name
    formData.mobile = user.value.mobile
  }
})
</script>

<style scoped>
.btn-primary {
    @apply bg-primary text-on-primary font-bold py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed;
}
.btn-secondary {
    @apply bg-surface-variant text-on-surface-variant font-semibold py-3 px-8 rounded-full transition duration-300 ease-in-out hover:bg-primary-container;
}
</style>