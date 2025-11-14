import { ref, computed } from 'vue';
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber
} from 'firebase/auth';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/store/auth';

const user = ref(null);
const loading = ref(false);
const error = ref(null);
const confirmationResult = ref(null);
const recaptchaVerifier = ref(null);

export function usePhoneAuth() {
  const auth = getAuth();
  const authStore = useAuthStore();

  const initRecaptcha = (containerId = 'recaptcha-container') => {
    try {
      if (!recaptchaVerifier.value) {
        recaptchaVerifier.value = new RecaptchaVerifier(auth, containerId, {
          size: 'invisible',
          callback: () => console.log('reCAPTCHA solved'),
          'expired-callback': () => {
            error.value = 'reCAPTCHA expired. Please try again.';
          }
        });
      }
      return recaptchaVerifier.value;
    } catch (err) {
      console.error('reCAPTCHA error:', err);
      error.value = 'Failed to initialize reCAPTCHA';
      return null;
    }
  };

  const sendOTP = async (phoneNumber) => {
    loading.value = true;
    error.value = null;
    
    try {
      let formattedPhone = phoneNumber.trim();
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+91' + formattedPhone;
      }

      const appVerifier = initRecaptcha();
      if (!appVerifier) throw new Error('Failed to initialize reCAPTCHA');

      confirmationResult.value = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      loading.value = false;
      return { success: true, message: 'OTP sent successfully' };
    } catch (err) {
      loading.value = false;
      console.error('OTP send error:', err);
      
      if (err.code === 'auth/invalid-phone-number') {
        error.value = 'Invalid phone number format';
      } else if (err.code === 'auth/too-many-requests') {
        error.value = 'Too many requests. Try again later.';
      } else {
        error.value = err.message || 'Failed to send OTP';
      }
      return { success: false, error: error.value };
    }
  };

  const verifyOTP = async (otpCode) => {
    loading.value = true;
    error.value = null;

    try {
      if (!confirmationResult.value) {
        throw new Error('No confirmation result. Send OTP first.');
      }

      const result = await confirmationResult.value.confirm(otpCode);
      const idToken = await result.user.getIdToken();

      const response = await authApi.loginWithPhone(idToken);

      authStore.setAuth({ user: response.data, token: response.data.token });
      
      user.value = response.data;

      loading.value = false;
      return { success: true, user: response.data };
    } catch (err) {
      loading.value = false;
      console.error('OTP verification error:', err);
      
      if (err.code === 'auth/invalid-verification-code') {
        error.value = 'Invalid OTP code.';
      } else if (err.code === 'auth/code-expired') {
        error.value = 'OTP expired. Request a new one.';
      } else {
        error.value = err.message || 'Failed to verify OTP';
      }
      return { success: false, error: error.value };
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      authStore.logout();
      user.value = null;
      confirmationResult.value = null;
      return { success: true };
    } catch (err) {
      console.error('Sign out error:', err);
      error.value = 'Failed to sign out';
      return { success: false, error: error.value };
    }
  };

  const isAuthenticated = computed(() => {
    return authStore.isAuthenticated;
  });

  const getCurrentUser = () => {
    return authStore.user;
  };

  const resetRecaptcha = () => {
    if (recaptchaVerifier.value) {
      recaptchaVerifier.value.clear();
      recaptchaVerifier.value = null;
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    initRecaptcha,
    sendOTP,
    verifyOTP,
    signOut,
    getCurrentUser,
    resetRecaptcha
  };
}
