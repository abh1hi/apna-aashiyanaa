<template>
  <div class="auth-page bg-gray-50">
    <div class="auth-container">
      <div class="text-center">
        <h1 class="auth-title text-gray-900">Create Account</h1>
        <p class="auth-subtitle text-gray-600">
          {{ showOTP ? 'Enter the OTP sent to your mobile' : 'Sign up as a buyer' }}
        </p>
      </div>

      <!-- Registration Form -->
      <form v-if="!showOTP" class="auth-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="name" class="sr-only">Full Name</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            placeholder="Full Name"
            class="auth-input"
            :class="{ 'input-error': error }"
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
            :class="{ 'input-error': error }"
          />
        </div>

        <div class="form-group">
          <label for="password" class="input-label">
            Password (Optional)
            <span class="text-sm text-gray-500 font-normal ml-1">- Set for password login</span>
          </label>
          <div class="password-input-wrapper">
            <input
              id="password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter password (min 6 characters)"
              minlength="6"
              class="auth-input"
            />
            <button 
              v-if="formData.password"
              type="button"
              @click="togglePasswordVisibility"
              class="password-toggle"
            >
              <svg v-if="!showPassword" class="password-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="password-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            You can login with password or OTP. Leave blank to use OTP only.
          </p>
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
            :class="{ 'input-error': error }"
          />
        </div>

        <p v-if="error" class="error-message">{{ error }}</p>

        <button 
          type="submit" 
          :disabled="isLoading"
          class="auth-button bg-blue-600 hover:bg-blue-700"
          :class="{ 'button-loading': isLoading }"
        >
          <span v-if="!isLoading">Send OTP</span>
          <span v-else>Sending...</span>
        </button>
      </form>

      <!-- OTP Verification -->
      <OTPVerification
        v-else
        :mobile="formData.mobile"
        :user-id="userId"
        @verify="handleVerifyOTP"
        @resend="handleRegister"
      />

      <p class="switch-auth-text">
        Already have an account? 
        <router-link to="/login" class="switch-auth-link">Sign in</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import authService from '../services/authService';
import OTPVerification from '../components/OTPVerification.vue';
import { useRouter } from 'vue-router';

export default {
  name: 'Register',
  components: {
    OTPVerification
  },
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {
      formData: {
        name: '',
        mobile: '',
        password: '',
        aadhaar: '',
        role: 'buyer'
      },
      userId: '',
      showOTP: false,
      showPassword: false,
      error: '',
      isLoading: false,
    };
  },
  methods: {
    async handleRegister() {
      // Validate inputs
      if (!this.formData.name || this.formData.name.trim() === '') {
        this.error = 'Please enter your full name';
        return;
      }

      const mobileRegex = /^[0-9]{10}$/;
      if (!this.formData.mobile || !mobileRegex.test(this.formData.mobile)) {
        this.error = 'Please enter a valid 10-digit mobile number';
        return;
      }

      // Validate password if provided
      if (this.formData.password && this.formData.password.length < 6) {
        this.error = 'Password must be at least 6 characters long';
        return;
      }

      // Validate Aadhaar if provided
      if (this.formData.aadhaar && this.formData.aadhaar.trim() !== '') {
        const aadhaarRegex = /^[0-9]{12}$/;
        if (!aadhaarRegex.test(this.formData.aadhaar)) {
          this.error = 'Aadhaar must be exactly 12 digits';
          return;
        }
      }

      this.error = '';
      this.isLoading = true;

      try {
        const userData = {
          name: this.formData.name.trim(),
          mobile: this.formData.mobile.trim(),
          role: this.formData.role
        };

        // Include password if provided
        if (this.formData.password && this.formData.password.trim() !== '') {
          userData.password = this.formData.password;
        }

        // Include aadhaar if provided
        if (this.formData.aadhaar && this.formData.aadhaar.trim() !== '') {
          userData.aadhaar = this.formData.aadhaar.trim();
        }

        await authService.register(userData);
        this.router.push('/');
      } catch (err) {
        console.error('Registration error:', err);
        this.error = err.message || 'Failed to register. Please try again.';
      } finally {
        this.isLoading = false;
      }
    },

    async handleVerifyOTP(otp) {
      this.error = '';

      try {
        const response = await authService.verifyOTP(this.userId, otp);
        
        // Redirect to home page after successful registration
        this.router.push('/');
      } catch (err) {
        console.error('OTP verification error:', err);
        throw new Error(err.message || 'Invalid OTP. Please try again.');
      }
    },

    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
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

.input-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
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

.password-input-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: #6b7280;
  transition: color 0.2s;
}

.password-toggle:hover {
  color: #374151;
}

.password-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
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
