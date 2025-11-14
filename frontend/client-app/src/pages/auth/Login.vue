<template>
  <div class="login-page min-h-screen bg-white flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <!-- Header -->
      <div class="text-center mb-8">
        <router-link to="/" class="text-3xl font-bold text-blue-600">
          Apna Aashiyanaa
        </router-link>
        <h1 class="text-2xl font-bold text-gray-900 mt-4 mb-2">Welcome</h1>
        <p class="text-gray-600">Sign in or create an account with your mobile number</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
        {{ error }}
      </div>

      <!-- Step 1: Enter Mobile Number -->
      <form v-if="!otpSent" @submit.prevent="handleSendOtp" class="space-y-6">
        <div>
          <label for="mobile" class="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
          <input
            id="mobile"
            v-model="form.mobile"
            type="tel"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your mobile number"
          />
        </div>
        <div id="recaptcha-container"></div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {{ loading ? 'Sending OTP...' : 'Send OTP' }}
        </button>
      </form>

      <!-- Step 2: Enter OTP -->
      <form v-if="otpSent" @submit.prevent="handleVerifyOtp" class="space-y-6">
        <p class="text-center text-gray-600">
          Enter the OTP sent to <strong>{{ form.mobile }}</strong>
        </p>
        <input
          id="otp"
          v-model="form.otp"
          type="text"
          required
          class="w-full px-4 py-3 border border-gray-300 rounded-lg text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="------"
        />
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-semibold"
        >
          {{ loading ? 'Verifying...' : 'Verify OTP & Login' }}
        </button>
        <button @click="reset" class="w-full text-sm text-gray-600 hover:underline mt-2">
          Back
        </button>
      </form>

      <!-- Links -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          By continuing, you agree to our
          <a href="#" class="text-blue-600 hover:underline">Terms of Service</a>.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import authService from '@/services/authService';
import { useAuthStore } from '@/store/auth';

const router = useRouter();
const authStore = useAuthStore();

const otpSent = ref(false);
const form = ref({
  mobile: '',
  otp: '',
});

const loading = ref(false);
const error = ref('');

onMounted(() => {
  // Initialize reCAPTCHA on component mount
  authService.initRecaptcha();
});

const reset = () => {
  otpSent.value = false;
  form.value.otp = '';
  error.value = '';
};

const handleSendOtp = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await authService.sendOTP(form.value.mobile);
    if (res.success) {
      otpSent.value = true;
    } else {
      error.value = res.message;
    }
  } catch (err) {
    error.value = err.message || 'Failed to send OTP.';
  } finally {
    loading.value = false;
  }
};

const handleVerifyOtp = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await authService.verifyOTP(form.value.otp);
    if (res.success) {
      authStore.setUser(res.user);
      router.push('/');
    } else {
      error.value = res.message;
    }
  } catch (err) {
    error.value = err.message || 'OTP verification failed.';
  } finally {
    loading.value = false;
  }
};
</script>
