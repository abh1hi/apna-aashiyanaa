/**
 * Authentication Guard Utilities
 * Provides helper functions for auth state management and route protection
 */

import { getAuth } from 'firebase/auth';

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user is logged in
 */
export const isAuthenticated = () => {
  const auth = getAuth();
  return auth.currentUser !== null;
};

/**
 * Get current user's authentication token
 * @returns {Promise<string|null>} - Firebase ID token or null
 */
export const getAuthToken = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    return null;
  }
  
  try {
    const token = await user.getIdToken();
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Get current user's phone number
 * @returns {string|null} - User's phone number or null
 */
export const getUserPhone = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  return user?.phoneNumber || null;
};

/**
 * Get current user's UID
 * @returns {string|null} - User's unique ID or null
 */
export const getUserId = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  return user?.uid || null;
};

/**
 * Get current user object
 * @returns {Object|null} - Firebase user object or null
 */
export const getCurrentUser = () => {
  const auth = getAuth();
  return auth.currentUser;
};

/**
 * Wait for auth state to be initialized
 * @returns {Promise<Object|null>} - Resolves with user object or null
 */
export const waitForAuth = () => {
  return new Promise((resolve) => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

/**
 * Navigation guard for protected routes
 * Use in router beforeEach hook
 * @param {Object} to - Target route
 * @param {Object} from - Current route
 * @param {Function} next - Navigation callback
 */
export const authGuard = async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  if (requiresAuth) {
    const user = await waitForAuth();
    
    if (!user) {
      // User not authenticated, redirect to login
      next({
        path: '/auth',
        query: { redirect: to.fullPath }
      });
    } else {
      // User authenticated, proceed
      next();
    }
  } else {
    // Route doesn't require auth
    next();
  }
};

/**
 * Check if route requires authentication
 * @param {Object} route - Vue router route object
 * @returns {boolean} - True if auth required
 */
export const requiresAuth = (route) => {
  return route.matched.some(record => record.meta.requiresAuth);
};

/**
 * Store user data in localStorage
 * @param {Object} userData - User data to store
 */
export const storeUserData = (userData) => {
  try {
    localStorage.setItem('userData', JSON.stringify(userData));
  } catch (error) {
    console.error('Error storing user data:', error);
  }
};

/**
 * Get stored user data from localStorage
 * @returns {Object|null} - Stored user data or null
 */
export const getStoredUserData = () => {
  try {
    const data = localStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting stored user data:', error);
    return null;
  }
};

/**
 * Clear stored user data
 */
export const clearUserData = () => {
  try {
    localStorage.removeItem('userData');
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};

export default {
  isAuthenticated,
  getAuthToken,
  getUserPhone,
  getUserId,
  getCurrentUser,
  waitForAuth,
  authGuard,
  requiresAuth,
  storeUserData,
  getStoredUserData,
  clearUserData
};
