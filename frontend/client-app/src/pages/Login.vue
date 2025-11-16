<!--
  This component provides a streamlined, OTP-based login flow for existing users.
  It leverages the centralized authService to handle all Firebase interactions:
  1. Captures the user's mobile number.
  2. Manages the reCAPTCHA challenge.
  3. Calls authService.sendOTP to trigger the Firebase phone authentication process.
  4. Switches to the OTPVerification component upon successful OTP dispatch.
  5. On successful OTP verification, it calls authService.verifyOTPAndLogin to
     log the user in, which validates the token on the backend and fetches user data.
  6. Redirects the user to their profile page upon successful login.
-->
<template>
  <div class="auth-page bg-gray-50">
    <div class="auth-container">
      <div class="text-center">
        <h1 class="auth-title text-gray-900">Sign In</h1>
        <p class="auth-subtitle text-gray-600">
          {{ showOTP ? 'Enter the OTP sent to your mobile' : 'Login with your mobile number' }}
        </p>
      </div>

      <!-- Login Form -->
      <form v-if="!showOTP" class="auth-form" @submit.prevent="handleSendOTP">
        <div class="form-group">
          <label for="mobile" class="sr-only">Mobile Number</label>
          <input
            id="mobile"
            v-model="mobile"
            type="tel"
            inputmode="numeric"
            maxlength="10"
            required
            placeholder="Mobile Number (10 digits)"
            class="auth-input"
          />
        </div>

        <!-- reCAPTCHA Container -->
        <div id="recaptcha-container" class="mb-4 flex justify-center"></div>

        <p v-if="error" class="error-message">{{ error }}</p>

        <button 
          type="submit" 
          :disabled="isLoading || !recaptchaSolved"
          class="auth-button bg-blue-600 hover:bg-blue-700"
          :class="{ 'opacity-50 cursor-not-allowed': !recaptchaSolved }"
        >
          <span v-if="isLoading">Sending...</span>
          <span v-else>Send OTP</span>
        </button>
      </form>

      <!-- OTP Verification Component -->
      <OTPVerification
        v-else
        identifier="login-otp-verification"
        :mobile="mobile"
        @verify="handleVerifyOTPAndLogin"
        @resend="handleSendOTP"
      />

      <p class="switch-auth-text">
        Don't have an account? 
        <router-link to="/register" class="switch-auth-link">Sign up</router-link>
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../services/authService';
import OTPVerification from '../components/OTPVerification.vue';

const router = useRouter();

const mobile = ref('');
const showOTP = ref(false);
const error = ref('');
const isLoading = ref(false);
const recaptchaSolved = ref(false);

// Initialize reCAPTCHA when the component mounts
onMounted(() => {
  try {
    authService.initRecaptcha('recaptcha-container', (solved) => {
      recaptchaSolved.value = solved;
      if (!solved) {
        error.value = 'reCAPTCHA response expired. Please solve it again.';
      }
    });
  } catch (err) {
    console.error('Failed to initialize reCAPTCHA', err);
    error.value = 'Failed to load authentication service. Please refresh the page.';
  }
});

// Validates the mobile number format.
const validateMobile = () => {
  const mobileRegex = /^[0-9]{10}$/;
  if (!mobile.value || !mobileRegex.test(mobile.value)) {
    error.value = 'Please enter a valid 10-digit mobile number';
    return false;
  }
  error.value = '';
  return true;
};

// Step 1: Validate input and send OTP.
const handleSendOTP = async () => {
  if (!validateMobile()) return;
  if (!recaptchaSolved.value) {
    error.value = 'Please solve the reCAPTCHA before proceeding.';
    return;
  }

  isLoading.value = true;
  error.value = '';

  try {
    await authService.sendOTP(mobile.value);
    showOTP.value = true; // Proceed to OTP verification view
  } catch (err) {
    console.error('Send OTP error:', err);
    error.value = err.message || 'Failed to send OTP. Please check the number and try again.';
    recaptchaSolved.value = false; // Reset reCAPTCHA to allow a retry
    authService.initRecaptcha('recaptcha-container', (solved) => {
      recaptchaSolved.value = solved;
    });
  } finally {
    isLoading.value = false;
  }
};

// Step 2: Verify OTP and log the user in.
const handleVerifyOTPAndLogin = async (otp) => {
  isLoading.value = true;
  error.value = '';

  try {
    const response = await authService.verifyOTPAndLogin(otp);

    if (response.success) {
      // On successful login, redirect to the user's profile
      router.push({ name: 'UserProfile' });
    } else {
      error.value = response.message || 'Login failed.';
      showOTP.value = false; // Revert to the form on failure
    }
  } catch (err) {
    console.error('Login error after OTP:', err);
    error.value = err.message || 'Invalid OTP or login failed.';
    showOTP.value = false; // Revert to the form on failure
  } finally {
    isLoading.value = false;
  }
};

</script>

<style scoped>
/* Component-specific styles */
.auth-page { display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 1rem; }
.auth-container { width: 100%; max-width: 420px; padding: 2.5rem; background-color: #ffffff; border-radius: 24px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05); }
.auth-title { font-size: 2.25rem; font-weight: 800; letter-spacing: -0.025em; }
.auth-subtitle { margin-top: 0.5rem; font-size: 1rem; line-height: 1.5; }
.auth-form { margin-top: 2rem; }
.form-group { margin-bottom: 1.5rem; }
.auth-input { width: 100%; padding: 1rem 1.25rem; font-size: 1rem; border: 1px solid #e2e8f0; border-radius: 12px; transition: all 0.2s ease; }
.auth-input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
.error-message { color: #ef4444; font-size: 0.875rem; text-align: center; margin-bottom: 1rem; }
.auth-button { width: 100%; padding: 1rem; font-size: 1rem; font-weight: 600; color: #ffffff; border: none; border-radius: 12px; cursor: pointer; transition: all 0.2s ease-in-out; }
.auth-button:hover:not(:disabled) { transform: translateY(-1px); }
.auth-button:disabled { opacity: 0.5; cursor: not-allowed; }
.switch-auth-text { text-align: center; margin-top: 2rem; font-size: 0.9rem; color: #4b5563; }
.switch-auth-link { font-weight: 600; color: #2563eb; text-decoration: none; transition: color 0.2s ease-in-out; }
.switch-auth-link:hover { color: #1d4ed8; }
</style>
