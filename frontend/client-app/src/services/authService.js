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
    this.currentUser = null; // Add a property to store the user

    // Listen for auth state changes and update the currentUser property
    onAuthStateChanged(auth, user => {
      this.currentUser = user;
    });
  }

  /**
   * Initialize reCAPTCHA
   */
  initRecaptcha(containerId = 'recaptcha-container', callback) {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear(); // Clear previous instance
    }

    this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'normal',
      callback: (response) => {
        console.log('reCAPTCHA solved');
        this.recaptchaSolved = true;
        if (callback) callback(true);
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
        this.recaptchaSolved = false;
        if (callback) callback(false);
      }
    });

    return this.recaptchaVerifier.render();
  }

  /**
   * Get the current Firebase user's ID token.
   * This will automatically refresh the token if it's expired.
   */
  async getIdToken() {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return await user.getIdToken();
  }

  /**
   * Send OTP to phone number
   */
  async sendOTP(phoneNumber) {
    if (!this.recaptchaSolved) {
      throw new Error('Please solve the reCAPTCHA first.');
    }

    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const appVerifier = this.recaptchaVerifier;

      this.confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier
      );

      this.recaptchaSolved = false; // Reset reCAPTCHA state

      return {
        success: true,
        message: 'OTP sent successfully'
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      this.recaptchaSolved = false; // Reset on error
      throw error;
    }
  }

  /**
   * Verify OTP and then register/login the user with our backend.
   */
  async verifyOTPAndRegister(otp, userData) {
    try {
      if (!this.confirmationResult) {
        throw new Error('No OTP request found. Please request OTP first.');
      }

      // Confirm the OTP with Firebase
      const result = await this.confirmationResult.confirm(otp);
      const user = result.user;

      // Get the Firebase ID token
      const idToken = await user.getIdToken();

      // Send the token and user data to our backend
      const response = await api.post('/auth/phone', { ...userData, idToken });

      // The backend now returns the full user profile.
      // We will store this in localStorage for quick access to profile info,
      // but the ID token remains the source of truth for auth.
      localStorage.setItem('user', JSON.stringify(response.data.user));

      return { success: true, ...response.data };

    } catch (error) {
      console.error('Error during OTP verification and registration:', error);
      // If the backend returned an error, use that message
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Invalid OTP or registration failed.');
      }
      throw error; // Otherwise, rethrow the original error
    }
  }

  /**
   * Fetch the user's profile from the backend.
   */
  async getProfile() {
    try {
      const idToken = await this.getIdToken();
      const response = await api.get('/users/profile', {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });
      // Update local storage with the latest profile data
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response && error.response.status === 401) {
        // If we get a 401, it means the user is no longer valid, so sign them out.
        await this.logout();
      }
      throw error;
    }
  }

  /**
   * Update user profile.
   */
  async updateProfile(updateData) {
    try {
      const idToken = await this.getIdToken();
      const response = await api.put('/users/profile', updateData, {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });
      // Update local storage with the new profile data
      localStorage.setItem('user', JSON.stringify(response.data));
      return { success: true, user: response.data };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Sign out from both Firebase and our app state.
   */
  async logout() {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  /**
   * Get current user from local storage (for display purposes).
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Check if a user is currently logged in (via Firebase).
   */
  isAuthenticated() {
    return !!auth.currentUser;
  }
  
  /**
   * Listen to auth state changes from Firebase.
   */
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }
}

export default new AuthService();
