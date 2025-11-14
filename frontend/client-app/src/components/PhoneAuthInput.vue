<template>
  <div class="phone-auth-input">
    <!-- Phone Number Input Section -->
    <div v-if="!codeSent" class="space-y-4">
      <div class="form-group">
        <label for="phoneNumber" class="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <div class="flex gap-2">
          <!-- Country Code Selector -->
          <select
            v-model="countryCode"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :disabled="loading"
          >
            <option value="+91">🇮🇳 +91</option>
            <option value="+1">🇺🇸 +1</option>
            <option value="+44">🇬🇧 +44</option>
            <option value="+61">🇦🇺 +61</option>
          </select>

          <!-- Phone Number Input -->
          <input
            id="phoneNumber"
            v-model="phoneNumber"
            type="tel"
            placeholder="9876543210"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :disabled="loading"
            @keyup.enter="sendCode"
            maxlength="10"
          />
        </div>
        <p v-if="phoneError" class="text-red-500 text-sm mt-1">{{ phoneError }}</p>
      </div>

      <!-- Send Code Button -->
      <button
        @click="sendCode"
        :disabled="loading || !isValidPhone"
        class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        <span v-if="loading" class="flex items-center justify-center">
          <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Sending...
        </span>
        <span v-else>Send Verification Code</span>
      </button>
    </div>

    <!-- OTP Verification Section -->
    <div v-else class="space-y-4">
      <div class="form-group">
        <label for="verificationCode" class="block text-sm font-medium text-gray-700 mb-2">
          Enter 6-Digit Code
        </label>
        <p class="text-sm text-gray-600 mb-3">
          We've sent a verification code to {{ formattedPhone }}
        </p>
        <input
          id="verificationCode"
          v-model="verificationCode"
          type="text"
          inputmode="numeric"
          placeholder="000000"
          class="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          :disabled="loading"
          @keyup.enter="verifyCode"
          maxlength="6"
        />
        <p v-if="codeError" class="text-red-500 text-sm mt-1">{{ codeError }}</p>
      </div>

      <!-- Verify Button -->
      <button
        @click="verifyCode"
        :disabled="loading || verificationCode.length !== 6"
        class="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        <span v-if="loading" class="flex items-center justify-center">
          <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Verifying...
        </span>
        <span v-else>Verify Code</span>
      </button>

      <!-- Resend Code Section -->
      <div class="text-center">
        <button
          v-if="canResend"
          @click="resendCode"
          :disabled="loading"
          class="text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          Resend Code
        </button>
        <p v-else class="text-gray-500 text-sm">
          Resend code in {{ resendTimer }}s
        </p>
      </div>

      <!-- Back Button -->
      <button
        @click="resetForm"
        :disabled="loading"
        class="w-full text-gray-600 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
      >
        Change Phone Number
      </button>
    </div>

    <!-- Error/Success Messages -->
    <div v-if="message" :class="messageClass" class="mt-4 p-3 rounded-lg text-sm">
      {{ message }}
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import phoneAuthService from '../services/phoneAuthService'

export default {
  name: 'PhoneAuthInput',
  emits: ['success', 'error'],
  
  setup(props, { emit }) {
    // Form state
    const countryCode = ref('+91')
    const phoneNumber = ref('')
    const verificationCode = ref('')
    const codeSent = ref(false)
    const loading = ref(false)
    
    // Error states
    const phoneError = ref('')
    const codeError = ref('')
    const message = ref('')
    const messageType = ref('') // 'success' or 'error'
    
    // Resend timer
    const resendTimer = ref(60)
    const canResend = ref(false)
    let resendInterval = null

    // Computed properties
    const isValidPhone = computed(() => {
      return phoneNumber.value.length === 10 && /^[0-9]+$/.test(phoneNumber.value)
    })

    const formattedPhone = computed(() => {
      return phoneAuthService.formatPhoneNumber(phoneNumber.value, countryCode.value)
    })

    const messageClass = computed(() => {
      return messageType.value === 'success' 
        ? 'bg-green-100 text-green-700 border border-green-300'
        : 'bg-red-100 text-red-700 border border-red-300'
    })

    // Methods
    const showMessage = (msg, type = 'error') => {
      message.value = msg
      messageType.value = type
      setTimeout(() => {
        message.value = ''
      }, 5000)
    }

    const startResendTimer = () => {
      resendTimer.value = 60
      canResend.value = false
      
      resendInterval = setInterval(() => {
        resendTimer.value--
        if (resendTimer.value <= 0) {
          canResend.value = true
          clearInterval(resendInterval)
        }
      }, 1000)
    }

    const sendCode = async () => {
      phoneError.value = ''
      
      if (!isValidPhone.value) {
        phoneError.value = 'Please enter a valid 10-digit phone number'
        return
      }

      loading.value = true
      
      try {
        const result = await phoneAuthService.sendVerificationCode(formattedPhone.value)
        
        if (result.success) {
          codeSent.value = true
          showMessage('Verification code sent successfully!', 'success')
          startResendTimer()
        } else {
          phoneError.value = result.error
          showMessage(result.error, 'error')
        }
      } catch (error) {
        phoneError.value = 'Failed to send verification code'
        showMessage('Failed to send verification code', 'error')
      } finally {
        loading.value = false
      }
    }

    const verifyCode = async () => {
      codeError.value = ''
      
      if (verificationCode.value.length !== 6) {
        codeError.value = 'Please enter a 6-digit code'
        return
      }

      loading.value = true
      
      try {
        const result = await phoneAuthService.verifyCode(verificationCode.value)
        
        if (result.success) {
          showMessage('Phone number verified successfully!', 'success')
          emit('success', result.user)
        } else {
          codeError.value = result.error
          showMessage(result.error, 'error')
          emit('error', result.error)
        }
      } catch (error) {
        codeError.value = 'Failed to verify code'
        showMessage('Failed to verify code', 'error')
        emit('error', error)
      } finally {
        loading.value = false
      }
    }

    const resendCode = async () => {
      loading.value = true
      verificationCode.value = ''
      
      try {
        const result = await phoneAuthService.resendVerificationCode(formattedPhone.value)
        
        if (result.success) {
          showMessage('Verification code resent!', 'success')
          startResendTimer()
        } else {
          showMessage(result.error, 'error')
        }
      } catch (error) {
        showMessage('Failed to resend code', 'error')
      } finally {
        loading.value = false
      }
    }

    const resetForm = () => {
      codeSent.value = false
      verificationCode.value = ''
      phoneError.value = ''
      codeError.value = ''
      message.value = ''
      if (resendInterval) {
        clearInterval(resendInterval)
      }
    }

    // Lifecycle
    onMounted(async () => {
      await phoneAuthService.init()
    })

    onUnmounted(() => {
      if (resendInterval) {
        clearInterval(resendInterval)
      }
    })

    return {
      // State
      countryCode,
      phoneNumber,
      verificationCode,
      codeSent,
      loading,
      phoneError,
      codeError,
      message,
      resendTimer,
      canResend,
      
      // Computed
      isValidPhone,
      formattedPhone,
      messageClass,
      
      // Methods
      sendCode,
      verifyCode,
      resendCode,
      resetForm
    }
  }
}
</script>

<style scoped>
.phone-auth-input {
  max-width: 400px;
  margin: 0 auto;
}

/* Loader animation */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
