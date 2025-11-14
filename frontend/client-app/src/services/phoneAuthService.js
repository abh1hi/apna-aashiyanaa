/**
 * Firebase Phone Authentication Service
 * Implements phone number authentication using @capacitor-firebase/authentication
 * Supports SMS verification for Android devices
 */

import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';

class PhoneAuthService {
  constructor() {
    this.verificationId = null;
    this.verificationTimeout = 60; // seconds
  }

  /**
   * Initialize phone authentication listeners
   * Sets up event listeners for authentication state changes
   */
  async init() {
    try {
      // Add listener for auth state changes
      await FirebaseAuthentication.addListener('authStateChange', (result) => {
        console.log('Auth state changed:', result);
      });

      // Add listener for phone code sent
      await FirebaseAuthentication.addListener('phoneCodeSent', (result) => {
        console.log('Phone code sent:', result);
        this.verificationId = result.verificationId;
      });

      // Add listener for phone verification completed
      await FirebaseAuthentication.addListener('phoneVerificationCompleted', (result) => {
        console.log('Phone verification completed:', result);
      });

      // Add listener for phone verification failed
      await FirebaseAuthentication.addListener('phoneVerificationFailed', (result) => {
        console.error('Phone verification failed:', result);
      });

      console.log('Phone auth service initialized');
    } catch (error) {
      console.error('Error initializing phone auth service:', error);
      throw error;
    }
  }

  /**
   * Format phone number to E.164 format
   * @param {string} phoneNumber - Phone number to format
   * @param {string} countryCode - Country code (default: '+91' for India)
   * @returns {string} Formatted phone number
   */
  formatPhoneNumber(phoneNumber, countryCode = '+91') {
    // Remove all non-numeric characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present
    if (!phoneNumber.startsWith('+')) {
      return `${countryCode}${cleaned}`;
    }
    
    return `+${cleaned}`;
  }

  /**
   * Validate phone number format
   * @param {string} phoneNumber - Phone number to validate
   * @returns {boolean} True if valid
   */
  validatePhoneNumber(phoneNumber) {
    // Check if phone number is in E.164 format
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
  }

  /**
   * Send OTP to phone number
   * @param {string} phoneNumber - Phone number in E.164 format
   * @returns {Promise<object>} Verification result
   */
  async sendVerificationCode(phoneNumber) {
    try {
      // Validate phone number
      if (!this.validatePhoneNumber(phoneNumber)) {
        throw new Error('Invalid phone number format. Use E.164 format (e.g., +919876543210)');
      }

      console.log('Sending verification code to:', phoneNumber);

      // Check if running on native platform
      const isNative = Capacitor.isNativePlatform();
      
      if (!isNative) {
        throw new Error('Phone authentication is only supported on native platforms (Android/iOS)');
      }

      // Sign in with phone number
      const result = await FirebaseAuthentication.signInWithPhoneNumber({
        phoneNumber: phoneNumber,
      });

      // Store verification ID
      if (result.verificationId) {
        this.verificationId = result.verificationId;
      }

      return {
        success: true,
        verificationId: result.verificationId,
        message: 'Verification code sent successfully'
      };
    } catch (error) {
      console.error('Error sending verification code:', error);
      return {
        success: false,
        error: error.message || 'Failed to send verification code'
      };
    }
  }

  /**
   * Verify OTP code
   * @param {string} verificationCode - 6-digit OTP code
   * @param {string} verificationId - Verification ID (optional, uses stored ID if not provided)
   * @returns {Promise<object>} Authentication result
   */
  async verifyCode(verificationCode, verificationId = null) {
    try {
      const verId = verificationId || this.verificationId;

      if (!verId) {
        throw new Error('No verification ID found. Please request a new code.');
      }

      if (!verificationCode || verificationCode.length !== 6) {
        throw new Error('Invalid verification code. Please enter a 6-digit code.');
      }

      console.log('Verifying code...');

      // Confirm verification code
      const result = await FirebaseAuthentication.confirmVerificationCode({
        verificationId: verId,
        verificationCode: verificationCode
      });

      // Get current user
      const currentUser = await FirebaseAuthentication.getCurrentUser();

      return {
        success: true,
        user: currentUser.user,
        message: 'Phone number verified successfully'
      };
    } catch (error) {
      console.error('Error verifying code:', error);
      return {
        success: false,
        error: error.message || 'Failed to verify code'
      };
    }
  }

  /**
   * Resend verification code
   * @param {string} phoneNumber - Phone number in E.164 format
   * @returns {Promise<object>} Verification result
   */
  async resendVerificationCode(phoneNumber) {
    try {
      console.log('Resending verification code to:', phoneNumber);
      return await this.sendVerificationCode(phoneNumber);
    } catch (error) {
      console.error('Error resending verification code:', error);
      return {
        success: false,
        error: error.message || 'Failed to resend verification code'
      };
    }
  }

  /**
   * Get current authenticated user
   * @returns {Promise<object>} Current user
   */
  async getCurrentUser() {
    try {
      const result = await FirebaseAuthentication.getCurrentUser();
      return result.user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Sign out current user
   * @returns {Promise<boolean>} Success status
   */
  async signOut() {
    try {
      await FirebaseAuthentication.signOut();
      this.verificationId = null;
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      return false;
    }
  }

  /**
   * Link phone number to existing user
   * @param {string} phoneNumber - Phone number to link
   * @returns {Promise<object>} Link result
   */
  async linkPhoneNumber(phoneNumber) {
    try {
      if (!this.validatePhoneNumber(phoneNumber)) {
        throw new Error('Invalid phone number format');
      }

      // First send verification code
      const sendResult = await this.sendVerificationCode(phoneNumber);
      
      if (!sendResult.success) {
        throw new Error(sendResult.error);
      }

      return {
        success: true,
        verificationId: sendResult.verificationId,
        message: 'Verification code sent. Please verify to link phone number.'
      };
    } catch (error) {
      console.error('Error linking phone number:', error);
      return {
        success: false,
        error: error.message || 'Failed to link phone number'
      };
    }
  }

  /**
   * Update phone number for authenticated user
   * @param {string} newPhoneNumber - New phone number to update
   * @returns {Promise<object>} Update result
   */
  async updatePhoneNumber(newPhoneNumber) {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      return await this.linkPhoneNumber(newPhoneNumber);
    } catch (error) {
      console.error('Error updating phone number:', error);
      return {
        success: false,
        error: error.message || 'Failed to update phone number'
      };
    }
  }

  /**
   * Clean up listeners
   */
  async cleanup() {
    try {
      await FirebaseAuthentication.removeAllListeners();
      this.verificationId = null;
      console.log('Phone auth service cleaned up');
    } catch (error) {
      console.error('Error cleaning up phone auth service:', error);
    }
  }
}

// Export singleton instance
export default new PhoneAuthService();
