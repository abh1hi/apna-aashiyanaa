// Cloud Functions Service for Apna Aashiyanaa
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebaseConfig';

/**
 * User Profile Functions
 */

// Get user profile by UID
export const getUserProfile = async (uid) => {
  try {
    const getUserProfileFunction = httpsCallable(functions, 'getUserProfile');
    const result = await getUserProfileFunction({ uid });
    return result.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (uid, updates) => {
  try {
    const updateUserProfileFunction = httpsCallable(functions, 'updateUserProfile');
    const result = await updateUserProfileFunction({ uid, updates });
    return result.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Get user by phone number
export const getUserByPhone = async (phoneNumber) => {
  try {
    const getUserByPhoneFunction = httpsCallable(functions, 'getUserByPhone');
    const result = await getUserByPhoneFunction({ phoneNumber });
    return result.data;
  } catch (error) {
    console.error('Error fetching user by phone:', error);
    throw error;
  }
};

// Create custom token
export const createCustomToken = async (uid) => {
  try {
    const createCustomTokenFunction = httpsCallable(functions, 'createCustomToken');
    const result = await createCustomTokenFunction({ uid });
    return result.data.token;
  } catch (error) {
    console.error('Error creating custom token:', error);
    throw error;
  }
};

// Delete user account
export const deleteUserAccount = async (uid) => {
  try {
    const deleteUserAccountFunction = httpsCallable(functions, 'deleteUserAccount');
    const result = await deleteUserAccountFunction({ uid });
    return result.data;
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
};