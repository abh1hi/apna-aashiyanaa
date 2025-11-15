<!--
  This is the main registration component for new users.
  It handles the complete signup flow using Firebase phone authentication:
  1. Collects essential user details: Full Name, Mobile Number, and optional Aadhaar.
     The password field has been completely removed in favor of OTP-only authentication.
  2. Manages and validates the reCAPTCHA challenge.
  3. Calls authService to send an OTP to the provided mobile number.
  4. Switches to the OTP verification view.
  5. Calls authService to verify the OTP and create the new user profile on the backend.
  6. On successful registration, redirects the user to their new profile page.
-->
<template>
  <div class="auth-page bg-gray-50">
    <div class="auth-container">
      <div class="text-center">
        <h1 class="auth-title text-gray-900">Create Account</h1>
        <p class="auth-subtitle text-gray-600">
          {{ showOTP ? 'Enter the OTP sent to your mobile' : 'Sign up with your mobile number' }}
        </p>
      </div>

      <!-- Registration Form -->
      <form v-if="!showOTP" class="auth-form" @submit.prevent="handleSendOTP">
        <div class="form-group">
          <label for="name" class="sr-only">Full Name</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            placeholder="Full Name"
            class="auth-input"
          />
        </div>

        <div class="form-group">
          <label for="mobile" class="sr-only">Mobile Number</label>
          <input
            id="mobile"
            v-model="formData.mobile"
            type="tel"
            inputmode="numeric"
            maxlength="10"
            required
            placeholder="Mobile Number (10 digits)"
            class="auth-input"
          />
        </div>

        <div class="form-group">
          <label for="aadhaar" class="sr-only">Aadhaar Number (Optional)</label>
          <input
            id="aadhaar"
            v-model="formData.aadhaar"
            type="tel"
            inputmode="numeric"
            maxlength="12"
            placeholder="Aadhaar Number (Optional, 12 digits)"
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
        :mobile="formData.mobile"
        @verify="handleVerifyOTPAndRegister"
        @resend="handleSendOTP"
      />

      <p class="switch-auth-text">
        Already have an account? 
        <router-link to="/login" class="switch-auth-link">Sign in</router-link>
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../services/authService';
import OTPVerification from '../components/OTPVerification.vue';

const router = useRouter();

// Reactive state for the form data and component logic
const formData = reactive({
  name: '',
  mobile: '',
  aadhaar: '',
  role: 'buyer' // Default role for new sign-ups
});

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

const validateForm = () => {
  error.value = '';
  if (!formData.name || formData.name.trim() === '') {
    error.value = 'Please enter your full name';
    return false;
  }
  const mobileRegex = /^[0-9]{10}$/;
  if (!formData.mobile || !mobileRegex.test(formData.mobile)) {
    error.value = 'Please enter a valid 10-digit mobile number';
    return false;
  }
  if (formData.aadhaar && formData.aadhaar.trim() !== '') {
    const aadhaarRegex = /^[0-9]{12}$/;
    if (!aadhaarRegex.test(formData.aadhaar)) {
      error.value = 'Aadhaar must be exactly 12 digits';
      return false;
    }
  }
  return true;
};

// Step 1: Validate form and send OTP via authService
const handleSendOTP = async () => {
  if (!validateForm()) return;
  if (!recaptchaSolved.value) {
    error.value = 'Please solve the reCAPTCHA before proceeding.';
    return;
  }

  isLoading.value = true;
  error.value = '';

  try {
    await authService.sendOTP(formData.mobile);
    showOTP.value = true; // Move to OTP verification step
  } catch (err) {
    console.error('Send OTP error:', err);
    error.value = err.message || 'Failed to send OTP. This number may already be in use.';
    recaptchaSolved.value = false; // Reset reCAPTCHA to allow a retry
    authService.initRecaptcha('recaptcha-container', (solved) => {
      recaptchaSolved.value = solved;
    });
  } finally {
    isLoading.value = false;
  }
};

// Step 2: Verify OTP and create the user account via authService
const handleVerifyOTPAndRegister = async (otp) => {
  error.value = '';
  isLoading.value = true;

  // Prepare user data, excluding the mobile number which is handled by Firebase auth
  const registrationData = {
    name: formData.name.trim(),
    role: formData.role,
    ...(formData.aadhaar && { aadhaar: formData.aadhaar.trim() })
  };

  try {
    // The single, unified method for registration
    const response = await authService.verifyOTPAndRegister(otp, registrationData);
    
    if (response.success) {
      // On success, redirect the new user to their profile page
      router.push({ name: 'UserProfile' });
    } else {
      error.value = response.message || 'Registration failed.';
      showOTP.value = false; // Revert to form on failure
    }
  } catch (err) {
    console.error('Registration error after OTP:', err);
    error.value = err.message || 'Invalid OTP or registration failed.';
    showOTP.value = false; // Revert to form on failure
  } finally {
    isLoading.value = false;
  }
};

</script>

<style scoped>
/* Component-specific styles */
.auth-page { display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 1rem; }
.auth-container { width: 100%; max-width: 440px; padding: 2.5rem; background-color: #ffffff; border-radius: 24px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05); }
.auth-title { font-size: 2.25rem; font-weight: 800; letter-spacing: -0.025em; }
.auth-subtitle { margin-top: 0.5rem; font-size: 1rem; line-height: 1.5; }
.auth-form { margin-top: 2rem; }
.form-group { margin-bottom: 1.25rem; }
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
