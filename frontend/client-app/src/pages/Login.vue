<template>
  <div class="auth-page bg-gray-50">
    <div class="auth-container">
      <div class="text-center">
        <h1 class="auth-title text-gray-900">Welcome Back</h1>
        <p class="auth-subtitle text-gray-600">{{ subtitleText }}</p>
      </div>

      <!-- Step 1: Mobile Input -->
      <form v-if="!checkedMethods" class="auth-form" @submit.prevent="handleMobileSubmit">
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

        <p v-if="error" class="error-message">{{ error }}</p>

        <button 
          type="submit" 
          :disabled="isLoading"
          class="auth-button bg-blue-600 hover:bg-blue-700"
          :class="{ 'button-loading': isLoading }"
        >
          <span v-if="!isLoading">Continue</span>
          <span v-else>Checking...</span>
        </button>
      </form>

      <!-- Step 2: Auth Method Selection -->
      <div v-if="checkedMethods && !authMethodChosen" class="auth-methods">
        <p v-if="error" class="error-message">{{ error }}</p>
        <p class="methods-title">Choose login method:</p>

        <button 
          v-if="availableMethods.includes('password')"
          @click="chooseAuthMethod('password')"
          class="method-button bg-blue-600 hover:bg-blue-700 text-white"
        >
          Login with Password
        </button>

        <button 
          v-if="availableMethods.includes('otp')"
          @click="chooseAuthMethod('otp')"
          class="method-button bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          Login with OTP
        </button>

        <button 
          @click="resetForm"
          class="back-button"
        >
          ← Back
        </button>
      </div>

      <!-- Step 3: Password Login -->
      <form v-if="authMethodChosen && selectedMethod === 'password'" class="auth-form" @submit.prevent="handlePasswordLogin">
        <div class="form-group">
          <label for="mobile-display" class="input-label">Mobile Number</label>
          <input
            id="mobile-display"
            v-model="mobile"
            type="tel"
            disabled
            class="auth-input bg-gray-100"
          />
        </div>

        <div class="form-group">
          <label for="password" class="input-label">Password</label>
          <div class="password-input-wrapper">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="Enter your password"
              class="auth-input"
              :class="{ 'input-error': error }"
            />
            <button 
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
        </div>
        <p v-if="error" class="error-message">{{ error }}</p>
        <button 
          type="submit"
          :disabled="isLoading"
          class="auth-button bg-blue-600 hover:bg-blue-700"
        >
          <span v-if="!isLoading">Login</span>
          <span v-else>Logging in...</span>
        </button>
        <button 
          type="button"
          @click="resetForm"
          class="back-button"
        >
          ← Back
        </button>
      </form>

      <!-- Step 3: OTP Verification -->
      <OTPVerification
        v-if="authMethodChosen && selectedMethod === 'otp'"
        :mobile="mobile"
        :user-id="userId"
        @verify="handleVerifyOTP"
        @resend="handleSendOTP"
        @back="resetForm"
      />

      <p class="switch-auth-text">
        Don't have an account? 
        <router-link to="/register" class="switch-auth-link">Create one</router-link>
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
      password: '',
      userId: '',
      showPassword: false,
      error: '',
      isLoading: false,
      checkedMethods: false,
      availableMethods: [],
      selectedMethod: '',
      authMethodChosen: false,
    };
  },
  computed: {
    subtitleText() {
      if (this.selectedMethod === 'otp') {
        return 'Enter the OTP sent to your mobile';
      } else if (this.selectedMethod === 'password') {
        return 'Enter your password to continue';
      } else if (this.checkedMethods && !this.authMethodChosen) {
        return 'Select your preferred login method';
      }
      return 'Sign in with your mobile number';
    }
  },
  methods: {
    async handleMobileSubmit() {
      const mobileRegex = /^[0-9]{10}$/;
      if (!this.mobile || !mobileRegex.test(this.mobile)) {
        this.error = 'Please enter a valid 10-digit mobile number';
        return;
      }
      this.error = '';
      this.isLoading = true;
      
      console.log('[Login] Checking auth methods for mobile:', this.mobile);
      
      try {
        const response = await authService.checkAuthMethod(this.mobile);
        console.log('[Login] Auth method response:', response);
        
        this.availableMethods = response.availableMethods || [];
        this.checkedMethods = true;
        this.error = '';
        
        console.log('[Login] Available methods:', this.availableMethods);
      } catch (err) {
        console.error('[Login] Check auth method error:', err);
        console.error('[Login] Error details:', {
          message: err.message,
          response: err.response,
          stack: err.stack
        });
        
        // Extract error message
        let errorMessage = 'Failed to check authentication method.';
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        this.error = errorMessage;
      } finally {
        this.isLoading = false;
      }
    },
    
    chooseAuthMethod(method) {
      console.log('[Login] Auth method chosen:', method);
      this.selectedMethod = method;
      this.authMethodChosen = true;
      if (method === 'otp') {
        this.handleSendOTP();
      }
    },
    
    async handlePasswordLogin() {
      this.error = '';
      this.isLoading = true;
      
      console.log('[Login] Attempting password login for mobile:', this.mobile);
      
      try {
        const response = await authService.loginWithPassword(this.mobile, this.password);
        console.log('[Login] Password login success:', response);
        
        const redirect = this.route.query.redirect || '/';
        console.log('[Login] Redirecting to:', redirect);
        
        this.router.push(redirect);
      } catch (err) {
        console.error('[Login] Password login error:', err);
        console.error('[Login] Error details:', {
          message: err.message,
          response: err.response,
          stack: err.stack
        });
        
        // Extract error message
        let errorMessage = 'Invalid credentials. Please try again.';
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        this.error = errorMessage;
      } finally {
        this.isLoading = false;
      }
    },
    
    async handleSendOTP() {
      this.error = '';
      this.isLoading = true;
      
      console.log('[Login] Sending OTP to mobile:', this.mobile);
      
      try {
        const response = await authService.loginWithOTP(this.mobile);
        console.log('[Login] OTP sent, response:', response);
        
        this.userId = response.userId;
        this.error = '';
      } catch (err) {
        console.error('[Login] Send OTP error:', err);
        console.error('[Login] Error details:', {
          message: err.message,
          response: err.response,
          stack: err.stack
        });
        
        // Extract error message
        let errorMessage = 'Failed to send OTP. Please try again.';
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        this.error = errorMessage;
      } finally {
        this.isLoading = false;
      }
    },
    
    async handleVerifyOTP(otp) {
      this.error = '';
      
      console.log('[Login] Verifying OTP for userId:', this.userId);
      
      try {
        const response = await authService.verifyOTP(this.userId, otp);
        console.log('[Login] OTP verification success:', response);
        
        const redirect = this.route.query.redirect || '/';
        console.log('[Login] Redirecting to:', redirect);
        
        this.router.push(redirect);
      } catch (err) {
        console.error('[Login] OTP verification error:', err);
        console.error('[Login] Error details:', {
          message: err.message,
          response: err.response,
          stack: err.stack
        });
        
        // Extract error message
        let errorMessage = 'Invalid OTP. Please try again.';
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        this.error = errorMessage;
        // Don't re-throw - let OTPVerification handle its own error display
      }
    },
    
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    
    resetForm() {
      console.log('[Login] Resetting form');
      this.checkedMethods = false;
      this.selectedMethod = '';
      this.authMethodChosen = false;
      this.mobile = '';
      this.password = '';
      this.userId = '';
      this.error = '';
    }
  },
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.auth-container {
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.auth-title {
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.auth-subtitle {
  font-size: 0.95rem;
  margin-bottom: 2rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.auth-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.auth-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.auth-input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
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
}

.password-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  text-align: center;
  margin: -0.5rem 0 0 0;
}

.auth-button {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
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

.auth-methods {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.methods-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  text-align: center;
  margin-bottom: 0.5rem;
}

.method-button {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button {
  background: none;
  border: none;
  color: #3b82f6;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.5rem;
  margin-top: 0.5rem;
  transition: color 0.2s ease;
}

.back-button:hover {
  color: #2563eb;
}

.switch-auth-text {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.switch-auth-link {
  color: #3b82f6;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;
}

.switch-auth-link:hover {
  color: #2563eb;
  text-decoration: underline;
}
</style>