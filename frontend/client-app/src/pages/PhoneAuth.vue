<template>
  <div class="phone-auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h2>{{ isOtpSent ? 'Verify OTP' : 'Login / Sign Up' }}</h2>
        <p>{{ isOtpSent ? 'Enter the OTP sent to your phone' : 'Enter your phone number to continue' }}</p>
      </div>

      <div class="auth-body">
        <!-- Phone Number Input -->
        <div v-if="!isOtpSent" class="form-group">
          <label for="phone">Phone Number</label>
          <div class="phone-input-group">
            <span class="country-code">+91</span>
            <input
              id="phone"
              v-model="phoneNumber"
              type="tel"
              placeholder="Enter 10-digit mobile number"
              maxlength="10"
              @keypress="validatePhoneInput"
              @keyup.enter="handleSendOTP"
              :disabled="loading"
            />
          </div>
          <p v-if="phoneError" class="error-message">{{ phoneError }}</p>
        </div>

        <!-- OTP Input -->
        <div v-if="isOtpSent" class="form-group">
          <label for="otp">Enter OTP</label>
          <input
            id="otp"
            v-model="otpCode"
            type="text"
            placeholder="Enter 6-digit OTP"
            maxlength="6"
            @keypress="validateOTPInput"
            @keyup.enter="handleVerifyOTP"
            :disabled="loading"
          />
          <p v-if="otpError" class="error-message">{{ otpError }}</p>
          
          <div class="resend-container">
            <button
              v-if="canResend"
              @click="handleSendOTP"
              class="resend-button"
              :disabled="loading"
            >
              Resend OTP
            </button>
            <span v-else class="resend-timer">
              Resend OTP in {{ resendTimer }}s
            </span>
          </div>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="alert alert-error">
          {{ error }}
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="alert alert-success">
          {{ successMessage }}
        </div>

        <!-- Action Button -->
        <button
          v-if="!isOtpSent"
          @click="handleSendOTP"
          class="btn-primary"
          :disabled="loading || !isPhoneValid"
        >
          <span v-if="loading">Sending...</span>
          <span v-else>Send OTP</span>
        </button>

        <button
          v-if="isOtpSent"
          @click="handleVerifyOTP"
          class="btn-primary"
          :disabled="loading || !isOTPValid"
        >
          <span v-if="loading">Verifying...</span>
          <span v-else>Verify & Login</span>
        </button>

        <!-- Back Button -->
        <button
          v-if="isOtpSent"
          @click="handleBack"
          class="btn-secondary"
          :disabled="loading"
        >
          Change Number
        </button>
      </div>

      <!-- reCAPTCHA Container -->
      <div id="recaptcha-container"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePhoneAuth } from '@/composables/usePhoneAuth';

const router = useRouter();
const {
  user,
  loading,
  error: authError,
  sendOTP,
  verifyOTP,
  initRecaptcha,
  resetRecaptcha
} = usePhoneAuth();

const phoneNumber = ref('');
const otpCode = ref('');
const isOtpSent = ref(false);
const phoneError = ref('');
const otpError = ref('');
const error = ref('');
const successMessage = ref('');
const resendTimer = ref(60);
const canResend = ref(false);
let resendInterval = null;

const isPhoneValid = computed(() => {
  return phoneNumber.value.length === 10 && /^[6-9]\d{9}$/.test(phoneNumber.value);
});

const isOTPValid = computed(() => {
  return otpCode.value.length === 6 && /^\d{6}$/.test(otpCode.value);
});

const validatePhoneInput = (event) => {
  const char = String.fromCharCode(event.keyCode);
  if (!/[0-9]/.test(char)) {
    event.preventDefault();
  }
  phoneError.value = '';
};

const validateOTPInput = (event) => {
  const char = String.fromCharCode(event.keyCode);
  if (!/[0-9]/.test(char)) {
    event.preventDefault();
  }
  otpError.value = '';
};

const startResendTimer = () => {
  resendTimer.value = 60;
  canResend.value = false;
  
  resendInterval = setInterval(() => {
    resendTimer.value--;
    if (resendTimer.value <= 0) {
      canResend.value = true;
      clearInterval(resendInterval);
    }
  }, 1000);
};

const handleSendOTP = async () => {
  if (!isPhoneValid.value) {
    phoneError.value = 'Please enter a valid 10-digit mobile number';
    return;
  }

  error.value = '';
  successMessage.value = '';
  
  const result = await sendOTP(phoneNumber.value);
  
  if (result.success) {
    isOtpSent.value = true;
    successMessage.value = 'OTP sent successfully!';
    startResendTimer();
    
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } else {
    error.value = result.error || authError.value;
  }
};

const handleVerifyOTP = async () => {
  if (!isOTPValid.value) {
    otpError.value = 'Please enter a valid 6-digit OTP';
    return;
  }

  error.value = '';
  
  const result = await verifyOTP(otpCode.value);
  
  if (result.success) {
    successMessage.value = 'Login successful!';
    
    setTimeout(() => {
      router.push('/'); // Redirect to home or dashboard
    }, 1000);
  } else {
    error.value = result.error || authError.value;
    otpCode.value = '';
  }
};

const handleBack = () => {
  isOtpSent.value = false;
  otpCode.value = '';
  error.value = '';
  successMessage.value = '';
  canResend.value = false;
  
  if (resendInterval) {
    clearInterval(resendInterval);
  }
  
  resetRecaptcha();
};

onMounted(() => {
  initRecaptcha();
});

onUnmounted(() => {
  if (resendInterval) {
    clearInterval(resendInterval);
  }
});
</script>

<style scoped>
.phone-auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.auth-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 440px;
  width: 100%;
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 8px;
}

.auth-header p {
  color: #718096;
  font-size: 14px;
}

.auth-body {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
  font-size: 14px;
}

.phone-input-group {
  display: flex;
  align-items: center;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.3s;
}

.phone-input-group:focus-within {
  border-color: #667eea;
}

.country-code {
  background: #f7fafc;
  padding: 12px 16px;
  font-weight: 600;
  color: #2d3748;
  border-right: 2px solid #e2e8f0;
}

input[type="tel"],
input[type="text"] {
  flex: 1;
  padding: 12px 16px;
  border: none;
  font-size: 16px;
  outline: none;
  width: 100%;
}

.form-group input[type="text"] {
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  transition: border-color 0.3s;
}

.form-group input[type="text"]:focus {
  border-color: #667eea;
}

input:disabled {
  background: #f7fafc;
  cursor: not-allowed;
}

.error-message {
  color: #e53e3e;
  font-size: 13px;
  margin-top: 6px;
}

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

.alert-error {
  background: #fed7d7;
  color: #c53030;
  border: 1px solid #fc8181;
}

.alert-success {
  background: #c6f6d5;
  color: #22543d;
  border: 1px solid #68d391;
}

.btn-primary,
.btn-secondary {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 12px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover:not(:disabled) {
  background: #f7fafc;
}

.resend-container {
  margin-top: 12px;
  text-align: center;
}

.resend-button {
  background: none;
  border: none;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

.resend-button:hover:not(:disabled) {
  color: #764ba2;
}

.resend-timer {
  color: #718096;
  font-size: 14px;
}

#recaptcha-container {
  margin-top: 16px;
}
</style>
