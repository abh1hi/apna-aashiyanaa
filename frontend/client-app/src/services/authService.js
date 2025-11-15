import {
  auth
} from '../firebaseConfig.js';
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import api from './api';

class AuthService {
  constructor() {
    this.recaptchaVerifier = null;
    this.confirmationResult = null;
    this.recaptchaSolved = false;
  }

  /**
   * Initialize reCAPTCHA
   */
  initRecaptcha(containerId = 'recaptcha-container', callback) {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear(); // Clear previous instance
    }
    
    this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'normal', // Use a visible reCAPTCHA
      callback: (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        console.log('reCAPTCHA solved');
        this.recaptchaSolved = true;
        if (callback) callback(true);
      },
      'expired-callback': () => {
        // Response expired. Ask user to solve reCAPTCHA again.
        console.log('reCAPTCHA expired');
        this.recaptchaSolved = false;
        if (callback) callback(false);
      }
    });
    
    // Render the reCAPTCHA explicitly
    return this.recaptchaVerifier.render();
  }

  async checkAuthMethod(mobile) {
    try {
      const response = await api.post('/auth/check-method', { mobile });
      return response.data;
    } catch (error) {
      console.error('Error checking auth method:', error);
      throw error;
    }
  }

  async loginWithPassword(mobile, password) {
    try {
      const response = await api.post('/auth/login', { mobile, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      console.error('Error logging in with password:', error);
      throw error;
    }
  }

  async register(userData, otp) {
    try {
      if (!this.confirmationResult) {
        throw new Error('Please send an OTP first.');
      }

      const result = await this.confirmationResult.confirm(otp);
      const user = result.user;
      const idToken = await user.getIdToken();

      const response = await api.post('/auth/register', { ...userData, idToken });

      if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return { success: true, ...response.data };
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  }

  /**
   * Send OTP to phone number
   */
  async loginWithOTP(phoneNumber) {
    if (!this.recaptchaSolved) {
      throw new Error('Please solve the reCAPTCHA first.');
    }

    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      // The appVerifier is the rendered reCAPTCHA instance
      const appVerifier = this.recaptchaVerifier;

      this.confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier
      );
      
      // Reset reCAPTCHA state after use
      this.recaptchaSolved = false;

      return {
        success: true,
        message: 'OTP sent successfully'
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      this.recaptchaSolved = false; // Reset on error
      throw error; // Rethrow the original error
    }
  }

  /**
   * Verify OTP and log in the user
   */
  async verifyOTP(otp) {
    try {
      if (!this.confirmationResult) {
        throw new Error('No OTP request found. Please request OTP first.');
      }

      const result = await this.confirmationResult.confirm(otp);
      const user = result.user;
      const idToken = await user.getIdToken();

      // This endpoint handles both login and registration, but here it's used for login
      const response = await api.post('/auth/phone', { idToken });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      return {
        success: true,
        user: response.data.user,
        token: response.data.token
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: error.message || 'Invalid OTP'
      };
    }
  }

  async getProfile() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }
      const response = await api.get('/users/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  async updateProfile(userData) {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      const response = await api.put(`/users/${user._id}`, userData);
      localStorage.setItem('user', JSON.stringify(response.data));
      return { success: true, user: response.data };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, message: error.message || 'Failed to update profile' };
    }
  }

  /**
   * Sign out
   */
  async logout() {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Get current user from local storage
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Get auth token from local storage
   */
  getToken() {
    return localStorage.getItem('token');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Listen to auth state changes from Firebase
   */
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        callback({ user, idToken });
      } else {
        callback({ user: null, idToken: null });
      }
    });
  }
}

export default new AuthService();
