/**
 * Improved AuthService with better error handling
 * Handles rate limits, configuration errors, and reCAPTCHA state management
 */

import { 
  getAuth, 
  signInWithPhoneNumber, 
  RecaptchaVerifier,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';
import { auth } from '../firebaseConfig';
import api from './api';

class AuthService {
  constructor() {
    this.lastOTPAttempt = 0;
    this.OTP_COOLDOWN = 60000; // 60 seconds between OTP requests
  }

  /**
   * Initialize reCAPTCHA verifier with proper cleanup
   */
  initializeRecaptcha(containerId = 'recaptcha-container') {
    try {
      // Clear existing verifier
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.warn('Error clearing existing recaptcha:', e);
        }
        window.recaptchaVerifier = null;
      }

      // Create new verifier
      window.recaptchaVerifier = new RecaptchaVerifier(
        containerId,
        {
          size: 'invisible',
          callback: (response) => {
            console.log('reCAPTCHA solved successfully');
          },
          'expired-callback': () => {
            console.warn('reCAPTCHA expired, clearing verifier');
            if (window.recaptchaVerifier) {
              window.recaptchaVerifier.clear();
              window.recaptchaVerifier = null;
            }
          },
          'error-callback': (error) => {
            console.error('reCAPTCHA error:', error);
            if (window.recaptchaVerifier) {
              window.recaptchaVerifier.clear();
              window.recaptchaVerifier = null;
            }
          }
        },
        auth
      );

      return window.recaptchaVerifier;
    } catch (error) {
      console.error('Failed to initialize reCAPTCHA:', error);
      throw new Error('Failed to initialize verification. Please refresh the page.');
    }
  }

  /**
   * Clean up reCAPTCHA verifier
   */
  clearRecaptcha() {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.warn('Error clearing recaptcha:', e);
      }
      window.recaptchaVerifier = null;
    }
  }

  /**
   * Format phone number to E.164 format
   */
  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // If doesn't start with country code, add +91 for India
    if (!phoneNumber.startsWith('+')) {
      // Remove leading zeros
      cleaned = cleaned.replace(/^0+/, '');
      
      // Add country code if not present
      if (cleaned.length === 10) {
        cleaned = '91' + cleaned;
      }
      
      cleaned = '+' + cleaned;
    } else {
      cleaned = phoneNumber;
    }
    
    return cleaned;
  }

  /**
   * Check if cooldown period has passed
   */
  checkCooldown() {
    const now = Date.now();
    const timeSinceLastAttempt = now - this.lastOTPAttempt;
    
    if (timeSinceLastAttempt < this.OTP_COOLDOWN) {
      const waitTime = Math.ceil((this.OTP_COOLDOWN - timeSinceLastAttempt) / 1000);
      throw new Error(`Please wait ${waitTime} seconds before requesting another OTP`);
    }
  }

  /**
   * Send OTP to phone number with Firebase Phone Auth
   */
  async loginWithOTP(phoneNumber) {
    try {
      // Check cooldown
      this.checkCooldown();
      
      // Format phone number
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      console.log('[AuthService] Sending OTP to:', formattedPhone);

      // Clear any existing recaptcha
      this.clearRecaptcha();

      // Initialize new recaptcha
      const appVerifier = this.initializeRecaptcha();
      
      // Update last attempt time
      this.lastOTPAttempt = Date.now();

      // Sign in with phone number
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier
      );
      
      console.log('[AuthService] OTP sent successfully');
      return confirmationResult;
      
    } catch (error) {
      console.error('[AuthService] Error sending OTP:', error);
      
      // Clear recaptcha on error
      this.clearRecaptcha();
      
      // Handle specific Firebase error codes
      throw this.handleFirebaseError(error);
    }
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(confirmationResult, otp) {
    try {
      console.log('[AuthService] Verifying OTP');
      
      if (!confirmationResult) {
        throw new Error('No confirmation result. Please request OTP again.');
      }
      
      const result = await confirmationResult.confirm(otp);
      console.log('[AuthService] OTP verified successfully');
      
      // Clear recaptcha after successful verification
      this.clearRecaptcha();
      
      return result.user;
      
    } catch (error) {
      console.error('[AuthService] Error verifying OTP:', error);
      throw this.handleFirebaseError(error);
    }
  }

  /**
   * Handle Firebase-specific errors with user-friendly messages
   */
  handleFirebaseError(error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    
    console.error('[AuthService] Firebase Error:', {
      code: errorCode,
      message: errorMessage
    });

    // Map Firebase error codes to user-friendly messages
    switch (errorCode) {
      case 'auth/too-many-requests':
        return new Error(
          '⏱️ Too many attempts detected.\n\n' +
          'Solutions:\n' +
          '• Wait 30-60 minutes and try again\n' +
          '• Use test number: +911234567890 (code: 123456)\n' +
          '• Try a different browser or device\n' +
          '• Clear browser cache and reload page'
        );
      
      case 'auth/invalid-app-credential':
        return new Error(
          '⚙️ Authentication configuration issue.\n\n' +
          'This app is not properly configured for phone authentication. ' +
          'Please contact support or try again later.'
        );
      
      case 'auth/invalid-phone-number':
        return new Error(
          '📱 Invalid phone number format.\n\n' +
          'Please enter a valid phone number with country code.\n' +
          'Example: +911234567890'
        );
      
      case 'auth/invalid-verification-code':
        return new Error(
          '❌ Invalid verification code.\n\n' +
          'Please check the code and try again.'
        );
      
      case 'auth/code-expired':
        return new Error(
          '⏰ Verification code expired.\n\n' +
          'Please request a new code.'
        );
      
      case 'auth/quota-exceeded':
        return new Error(
          '🚫 SMS quota exceeded.\n\n' +
          'Please try again later or contact support.'
        );
      
      case 'auth/invalid-verification-id':
        return new Error(
          '🔑 Invalid verification session.\n\n' +
          'Please start the verification process again.'
        );
      
      case 'auth/missing-verification-code':
        return new Error(
          '📝 Please enter the verification code.'
        );
      
      case 'auth/captcha-check-failed':
        return new Error(
          '🤖 Verification failed.\n\n' +
          'Please refresh the page and try again.'
        );
      
      default:
        // Return original error if no specific handling
        return error;
    }
  }

  /**
   * Check available authentication methods for a mobile number
   */
  async checkAuthMethod(mobile) {
    try {
      console.log('[AuthService] Checking auth method for:', mobile);
      const response = await api.post('/auth/check-method', { mobile });
      return response.data;
    } catch (error) {
      console.error('[AuthService] Error checking auth method:', error);
      throw error;
    }
  }

  /**
   * Login with password
   */
  async loginWithPassword(mobile, password) {
    try {
      console.log('[AuthService] Logging in with password');
      const response = await api.post('/auth/login', { mobile, password });
      return response.data;
    } catch (error) {
      console.error('[AuthService] Password login error:', error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(userData) {
    try {
      console.log('[AuthService] Registering new user');
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('[AuthService] Registration error:', error);
      throw error;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return auth.currentUser;
  }

  /**
   * Sign out
   */
  async logout() {
    try {
      await signOut(auth);
      this.clearRecaptcha();
      console.log('[AuthService] User signed out');
    } catch (error) {
      console.error('[AuthService] Logout error:', error);
      throw error;
    }
  }
}

export default new AuthService();
