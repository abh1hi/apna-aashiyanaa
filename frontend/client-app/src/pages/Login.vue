<template>
  <div class="auth-page bg-gray-50">
    <div class="auth-container">
      <div class="text-center">
        <h1 class="auth-title text-gray-900">Welcome Back</h1>
        <p class="auth-subtitle text-gray-600">
          {{ showOTP ? 'Enter the OTP sent to your mobile' : 'Sign in with your mobile number' }}
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
            :class="{ 'input-error': error }"
          />
        </div>

        <!-- reCAPTCHA Container -->
        <div id="recaptcha-container" class="mb-4 flex justify-center"></div>

        <p v-if="error" class="error-message">{{ error }}</p>

        <button
          type="submit"
          :disabled="isLoading || !recaptchaSolved"
          class="auth-button bg-blue-600 hover:bg-blue-700"
          :class="{ 'button-loading': isLoading, 'opacity-50 cursor-not-allowed': !recaptchaSolved }"
        >
          <span v-if="!isLoading">Send OTP</span>
          <span v-else>Sending...</span>
        </button>
      </form>

      <!-- OTP Verification -->
      <OTPVerification
        v-else
        :mobile="mobile"
        identifier="login-otp-verification"
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

<script>
import authService from '../services/authService';
import OTPVerification from '../components/OTPVerification.vue';
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'Login',
  components: {
    OTPVerification
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    return { router, route };
  },
  data() {
    return {
      mobile: '',
      showOTP: false,
      error: '',
      isLoading: false,
      recaptchaSolved: false,
    };
  },
  mounted() {
    try {
      authService.initRecaptcha('recaptcha-container', (solved) => {
        this.recaptchaSolved = solved;
        if (!solved) {
          this.error = 'reCAPTCHA response expired. Please solve it again.';
        }
      });
    } catch (err) {
      console.error('Failed to initialize reCAPTCHA', err);
      this.error = 'Failed to load authentication service. Please refresh the page.';
    }
  },
  methods: {
    validateMobile() {
      this.error = '';
      const mobileRegex = /^[0-9]{10}$/;
      if (!this.mobile || !mobileRegex.test(this.mobile)) {
        this.error = 'Please enter a valid 10-digit mobile number';
        return false;
      }
      return true;
    },

    async handleSendOTP() {
      if (!this.validateMobile()) return;
      if (!this.recaptchaSolved) {
        this.error = 'Please solve the reCAPTCHA before proceeding.';
        return;
      }

      this.isLoading = true;
      this.error = '';

      try {
        await authService.loginWithOTP(this.mobile);
        this.showOTP = true;
      } catch (err) {
        console.error('Send OTP error:', err);
        this.error = err.message || 'Failed to send OTP. Please try again.';
        // Reset reCAPTCHA on failure to allow user to try again
        this.recaptchaSolved = false;
        authService.initRecaptcha('recaptcha-container', (solved) => {
          this.recaptchaSolved = solved;
        });
      } finally {
        this.isLoading = false;
      }
    },

    async handleVerifyOTPAndLogin(otp) {
      this.error = '';
      this.isLoading = true;

      try {
        const response = await authService.verifyOTP(otp);
        if (response.success) {
          const redirect = this.route.query.redirect || '/';
          this.router.push(redirect);
        } else {
          this.error = response.message || 'Login failed.';
          this.showOTP = false; // Go back to form on failure
        }
      } catch (err) {
        console.error('Login error after OTP:', err);
        this.error = err.response?.data?.message || err.message || 'Invalid OTP or login failed.';
        this.showOTP = false; // Go back to form on failure
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
}

.auth-container {
  width: 100%;
  max-width: 440px;
  padding: 2.5rem;
  background-color: #ffffff;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
}

.auth-title {
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: -0.025em;
}

.auth-subtitle {
  margin-top: 0.5rem;
  font-size: 1rem;
  line-height: 1.5;
}

.auth-form {
  margin-top: 2rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.auth-input {
  width: 100%;
  padding: 1rem 1.25rem;
  font-size: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.auth-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.input-error {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  text-align: center;
}

.auth-button {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.auth-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.auth-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-loading {
  opacity: 0.7;
}

.switch-auth-text {
  text-align: center;
  margin-top: 2rem;
  font-size: 0.9rem;
  color: #4b5563;
}

.switch-auth-link {
  font-weight: 600;
  color: #2563eb;
  text-decoration: none;
  transition: color 0.2s ease-in-out;
}

.switch-auth-link:hover {
  color: #1d4ed8;
}
</style>