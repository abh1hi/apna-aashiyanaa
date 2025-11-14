<template>
  <div class="otp-verification">
    <h2 class="otp-title">Enter OTP</h2>
    <p class="otp-subtitle">We've sent a 6-digit code to {{ maskedMobile }}</p>
    
    <form @submit.prevent="handleVerify" class="otp-form">
      <div class="otp-input-container">
        <input
          v-for="(digit, index) in otpDigits"
          :key="index"
          :ref="el => setInputRef(el, index)"
          v-model="otpDigits[index]"
          @input="handleInput(index, $event)"
          @keydown="handleKeydown(index, $event)"
          @paste="handlePaste"
          type="text"
          inputmode="numeric"
          maxlength="1"
          class="otp-input"
          :class="{ 'otp-input-error': error }"
        />
      </div>

      <p v-if="error" class="error-message">{{ error }}</p>

      <button 
        type="submit" 
        :disabled="isLoading || !isOtpComplete"
        class="verify-button"
        :class="{ 'button-loading': isLoading }"
      >
        <span v-if="!isLoading">Verify OTP</span>
        <span v-else>Verifying...</span>
      </button>

      <div class="resend-container">
        <span v-if="countdown > 0" class="countdown-text">
          Resend OTP in {{ countdown }}s
        </span>
        <button 
          v-else
          type="button"
          @click="handleResend"
          class="resend-button"
        >
          Resend OTP
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';

const props = defineProps({
  userId: { type: String, required: true },
  mobile: { type: String, required: true }
});

const router = useRouter();
const authStore = useAuthStore();

const otpDigits = ref(['', '', '', '', '', '']);
const inputRefs = ref([]);
const error = ref('');
const isLoading = ref(false);
const countdown = ref(60);
let countdownTimer = null;

const maskedMobile = computed(() => {
  if (!props.mobile) return '';
  const len = props.mobile.length;
  return props.mobile.substring(0, 2) + '*'.repeat(len - 4) + props.mobile.substring(len - 2);
});

const isOtpComplete = computed(() => {
  return otpDigits.value.every(digit => digit !== '');
});

const otpValue = computed(() => {
  return otpDigits.value.join('');
});

const setInputRef = (el, index) => {
  if (el) {
    inputRefs.value[index] = el;
  }
};

const handleInput = (index, event) => {
  const value = event.target.value;
  
  if (!/^[0-9]$/.test(value) && value !== '') {
    otpDigits.value[index] = '';
    return;
  }

  error.value = '';
  otpDigits.value[index] = value;

  if (value && index < 5) {
    nextTick(() => {
      inputRefs.value[index + 1]?.focus();
    });
  }
};

const handleKeydown = (index, event) => {
  if (event.key === 'Backspace') {
    if (!otpDigits.value[index] && index > 0) {
      otpDigits.value[index - 1] = '';
      nextTick(() => {
        inputRefs.value[index - 1]?.focus();
      });
    }
  } else if (event.key === 'ArrowLeft' && index > 0) {
    inputRefs.value[index - 1]?.focus();
  } else if (event.key === 'ArrowRight' && index < 5) {
    inputRefs.value[index + 1]?.focus();
  }
};

const handlePaste = (event) => {
  event.preventDefault();
  const pastedData = event.clipboardData.getData('text').trim();
  
  if (/^[0-9]{6}$/.test(pastedData)) {
    otpDigits.value = pastedData.split('');
    error.value = '';
    nextTick(() => {
      inputRefs.value[5]?.focus();
    });
  }
};

const handleVerify = async () => {
  if (!isOtpComplete.value) {
    error.value = 'Please enter complete OTP';
    return;
  }

  error.value = '';
  isLoading.value = true;

  try {
    await authStore.verifyOTP(props.userId, otpValue.value);
    router.push('/');
  } catch (err) {
    error.value = err.response?.data?.message || 'Invalid OTP. Please try again.';
    otpDigits.value = ['', '', '', '', '', ''];
    nextTick(() => {
      inputRefs.value[0]?.focus();
    });
  } finally {
    isLoading.value = false;
  }
};

const handleResend = async () => {
  otpDigits.value = ['', '', '', '', '', ''];
  error.value = '';
  countdown.value = 60;
  startCountdown();
  
  try {
    await authStore.login({ mobile: props.mobile }); // Re-initiate OTP for the same mobile
    // No need to navigate, just show success message or reset countdown
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to resend OTP.';
  }

  nextTick(() => {
    inputRefs.value[0]?.focus();
  });
};

const startCountdown = () => {
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }, 1000);
};

onMounted(() => {
  startCountdown();
  nextTick(() => {
    inputRefs.value[0]?.focus();
  });
});
</script>

<style scoped>
.otp-verification {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.otp-title {
  font-size: 1.75rem;
  font-weight: 700;
  text-align: center;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.otp-subtitle {
  text-align: center;
  color: #6b7280;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.otp-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.otp-input-container {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
}

.otp-input {
  width: 3rem;
  height: 3.5rem;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.otp-input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.otp-input-error {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  text-align: center;
  margin: -0.5rem 0 0 0;
}

.verify-button {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  background-color: #8b5cf6;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.verify-button:hover:not(:disabled) {
  background-color: #7c3aed;
  transform: translateY(-1px);
}

.verify-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-loading {
  opacity: 0.7;
}

.resend-container {
  text-align: center;
}

.countdown-text {
  color: #6b7280;
  font-size: 0.875rem;
}

.resend-button {
  background: none;
  border: none;
  color: #8b5cf6;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 0.2s ease;
}

.resend-button:hover {
  color: #7c3aed;
  text-decoration: underline;
}
</style>