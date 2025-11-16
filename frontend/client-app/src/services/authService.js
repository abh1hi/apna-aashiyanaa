import {
  auth
} from '../firebaseConfig.js';
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import axios from 'axios';
import api from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class AuthService {
  constructor() {
    this.recaptchaVerifier = null;
    this.confirmationResult = null;
    this.recaptchaSolved = false;
    this.currentUser = null;

    onAuthStateChanged(auth, user => {
      this.currentUser = user;
    });
  }

  initRecaptcha(containerId = 'recaptcha-container', callback) {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
    }
    this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'normal',
      callback: () => {
        this.recaptchaSolved = true;
        if (callback) callback(true);
      },
      'expired-callback': () => {
        this.recaptchaSolved = false;
        if (callback) callback(false);
      }
    });
    return this.recaptchaVerifier.render();
  }

  async getToken() {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  }

  async sendOTP(phoneNumber) {
    if (!this.recaptchaSolved) {
      throw new Error('Please solve the reCAPTCHA first.');
    }
    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const appVerifier = this.recaptchaVerifier;
      this.confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      this.recaptchaSolved = false;
      return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
      console.error('Error sending OTP:', error);
      this.recaptchaSolved = false;
      throw error;
    }
  }

  async verifyOTPAndLogin(otp) {
    try {
      if (!this.confirmationResult) {
        throw new Error('No OTP request found. Please request OTP first.');
      }
      const result = await this.confirmationResult.confirm(otp);
      const user = result.user;
      const idToken = await user.getIdToken();
      const response = await axios.post(`${API_BASE_URL}/auth/phone`, { idToken });
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return { success: true, ...response.data };
    } catch (error) {
      console.error('Error during OTP verification and login:', error);
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Invalid OTP or login failed.');
      }
      throw error;
    }
  }

  async verifyOTPAndRegister(otp, userData) {
    try {
      if (!this.confirmationResult) {
        throw new Error('No OTP request found. Please request OTP first.');
      }
      const result = await this.confirmationResult.confirm(otp);
      const user = result.user;
      const idToken = await user.getIdToken();
      const response = await axios.post(`${API_BASE_URL}/auth/phone`, { ...userData, idToken });
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return { success: true, ...response.data };
    } catch (error) {
      console.error('Error during OTP verification and registration:', error);
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Invalid OTP or registration failed.');
      }
      throw error;
    }
  }

  async getProfile() {
    try {
      const response = await api.get('/users/profile');
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response && error.response.status === 401) {
        await this.logout();
      }
      throw error;
    }
  }

  async updateProfile(updateData) {
    try {
      const response = await api.put('/users/profile', updateData);
      localStorage.setItem('user', JSON.stringify(response.data));
      return { success: true, user: response.data };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated() {
    return !!auth.currentUser;
  }
  
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }
}

export default new AuthService();
