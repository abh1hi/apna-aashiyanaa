<template>
  <div class="w-full max-w-md mx-auto p-4 md:p-8">
    <div class="text-center">
      <h1 class="text-3xl font-extrabold text-on-surface">Enter Code</h1>
      <p class="mt-2 text-secondary">
        We sent a 6-digit code to <span class="font-semibold text-on-surface">{{ maskedIdentifier }}</span>.
      </p>
    </div>

    <form @submit.prevent="handleVerify" class="mt-8">
      <div class="flex justify-center space-x-2 md:space-x-3">
        <input
          v-for="i in 6"
          :key="i"
          :ref="el => (inputs[i - 1] = el)"
          v-model="otp[i - 1]"
          @input="handleInput(i - 1, $event)"
          @keydown="handleKeydown(i - 1, $event)"
          @paste="handlePaste"
          type="text"
          inputmode="numeric"
          maxlength="1"
          class="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold bg-surface-variant border-2 rounded-xl transition-all duration-200"
          :class="[
            error ? 'border-error' : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/50',
            otp[i-1] ? 'border-primary' : ''
          ]"
        />
      </div>

      <p v-if="error" class="text-center text-error text-sm mt-4">{{ error }}</p>

      <div class="mt-8">
        <button
          type="submit"
          :disabled="isLoading || !isOtpComplete"
          class="w-full bg-primary text-on-primary font-bold py-4 px-4 rounded-full text-lg transition-transform duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center"
        >
          <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isLoading ? 'Verifying...' : 'Verify' }}
        </button>
      </div>
    </form>

    <div class="mt-6 text-center">
      <p v-if="countdown > 0" class="text-secondary">
        Resend code in <span class="font-bold text-on-surface">{{ countdown }}s</span>
      </p>
      <button v-else @click="handleResend" class="font-semibold text-primary hover:underline">
        Resend Code
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';

const props = defineProps({
  identifier: { // Can be phone or email
    type: String,
    required: true
  },
});

const emit = defineEmits(['verify', 'resend']);

const otp = ref(new Array(6).fill(''));
const inputs = ref([]);
const error = ref('');
const isLoading = ref(false);
const countdown = ref(60);

let countdownTimer = null;

const maskedIdentifier = computed(() => {
  if (!props.identifier) return '';
  if (props.identifier.includes('@')) { // Mask email
    const [name, domain] = props.identifier.split('@');
    return `${name.substring(0, 2)}****@${domain}`;
  } else { // Mask phone
    return `${props.identifier.substring(0, 2)}****${props.identifier.slice(-2)}`;
  }
});

const isOtpComplete = computed(() => otp.value.every(digit => digit.match(/^[0-9]$/)));
const otpValue = computed(() => otp.value.join(''));

const handleInput = (index, event) => {
  const value = event.target.value;
  error.value = '';

  if (value.match(/^[0-9]$/)) {
    if (index < 5) {
      nextTick(() => inputs.value[index + 1].focus());
    }
  } else if (value === '') {
    // This is handled by keydown
  } else {
    otp.value[index] = ''; // prevent non-numeric input
  }
};

const handleKeydown = (index, event) => {
  if (event.key === 'Backspace' && !otp.value[index] && index > 0) {
    nextTick(() => inputs.value[index - 1].focus());
  } else if (event.key === 'ArrowLeft' && index > 0) {
    inputs.value[index - 1].focus();
  } else if (event.key === 'ArrowRight' && index < 5) {
    inputs.value[index + 1].focus();
  }
};

const handlePaste = (event) => {
  event.preventDefault();
  const pastedData = (event.clipboardData || window.clipboardData).getData('text').trim();
  if (/^[0-9]{6}$/.test(pastedData)) {
    otp.value = pastedData.split('');
    error.value = '';
    nextTick(() => inputs.value[5].focus());
  }
};

const handleVerify = async () => {
  if (!isOtpComplete.value) {
    error.value = 'Please enter the complete 6-digit code.';
    return;
  }
  
  isLoading.value = true;
  error.value = '';
  
  try {
    // The parent will handle the actual API call and pass success/failure
    await emit('verify', otpValue.value);
  } catch (e) {
    error.value = e.message || 'Invalid or expired OTP.';
    otp.value = new Array(6).fill(''); // Clear inputs on error
    nextTick(() => inputs.value[0].focus());
  } finally {
    isLoading.value = false;
  }
};

const handleResend = () => {
  otp.value = new Array(6).fill('');
  error.value = '';
  emit('resend');
  startCountdown();
  nextTick(() => inputs.value[0].focus());
};

const startCountdown = () => {
  countdown.value = 60;
  if(countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(countdownTimer);
    }
  }, 1000);
};

onMounted(() => {
  startCountdown();
  nextTick(() => inputs.value[0]?.focus());
});

onUnmounted(() => {
  if(countdownTimer) clearInterval(countdownTimer);
});

// Expose a method for parent to manually set error
defineExpose({
  setError: (message) => {
    error.value = message;
    otp.value = new Array(6).fill('');
    nextTick(() => inputs.value[0].focus());
  }
});
</script>