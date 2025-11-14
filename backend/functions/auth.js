/**
 * Firebase Cloud Functions for Phone Authentication
 * Backend API endpoints for user authentication
 */

const admin = require('firebase-admin');
const functions = require('firebase-functions');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

/**
 * Verify Firebase ID Token
 * @param {string} idToken - Firebase ID token from client
 * @returns {Promise<Object>} - Decoded token with user info
 */
const verifyToken = async (idToken) => {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return {
      success: true,
      uid: decodedToken.uid,
      phoneNumber: decodedToken.phone_number,
      data: decodedToken
    };
  } catch (error) {
    console.error("Error verifying token:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get or Create User Profile
 * Called after successful phone authentication
 */
exports.getUserProfile = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated to get profile"
    );
  }

  const uid = context.auth.uid;
  const phoneNumber = context.auth.token.phone_number;

  try {
    // Check if user profile exists
    const userDoc = await db.collection("users").doc(uid).get();

    if (userDoc.exists) {
      // Return existing profile
      return {
        success: true,
        profile: userDoc.data(),
        isNewUser: false
      };
    } else {
      // Create new user profile
      const newProfile = {
        uid: uid,
        phoneNumber: phoneNumber,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        role: "user",
        isActive: true
      };

      await db.collection("users").doc(uid).set(newProfile);

      return {
        success: true,
        profile: newProfile,
        isNewUser: true
      };
    }
  } catch (error) {
    console.error("Error getting/creating user profile:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error processing user profile",
      error.message
    );
  }
});

/**
 * Update User Profile
 * Allows authenticated users to update their profile
 */
exports.updateUserProfile = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const uid = context.auth.uid;
  const { name, email, address, preferences } = data;

  try {
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Only update provided fields
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (address) updateData.address = address;
    if (preferences) updateData.preferences = preferences;

    await db.collection("users").doc(uid).update(updateData);

    return {
      success: true,
      message: "Profile updated successfully"
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error updating profile",
      error.message
    );
  }
});

/**
 * Get User by Phone Number
 * Admin function to retrieve user by phone
 */
exports.getUserByPhone = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { phoneNumber } = data;

  if (!phoneNumber) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Phone number is required'
    );
  }

  try {
    // Get user by phone number
    const userRecord = await auth.getUserByPhoneNumber(phoneNumber);
    
    // Get user profile from Firestore
    const userDoc = await db.collection('users').doc(userRecord.uid).get();

    return {
      success: true,
      user: {
        uid: userRecord.uid,
        phoneNumber: userRecord.phoneNumber,
        profile: userDoc.exists ? userDoc.data() : null
      }
    };
  } catch (error) {
    console.error('Error getting user by phone:', error);
    
    if (error.code === 'auth/user-not-found') {
      return {
        success: false,
        error: 'User not found'
      };
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Error retrieving user',
      error.message
    );
  }
});

/**
 * Create Custom Token
 * For advanced authentication flows
 */
exports.createCustomToken = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const uid = context.auth.uid;

  try {
    const customToken = await auth.createCustomToken(uid);
    
    return {
      success: true,
      token: customToken
    };
  } catch (error) {
    console.error('Error creating custom token:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error creating token',
      error.message
    );
  }
});

/**
 * Delete User Account
 * Allows users to delete their account
 */
exports.deleteUserAccount = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const uid = context.auth.uid;

  try {
    // Delete user profile from Firestore
    await db.collection('users').doc(uid).delete();
    
    // Delete user from Firebase Auth
    await auth.deleteUser(uid);

    return {
      success: true,
      message: 'Account deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting account:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error deleting account',
      error.message
    );
  }
});

/**
 * On User Create Trigger
 * Automatically creates user profile when new user signs up
 */
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  const { uid, phoneNumber } = user;

  try {
    // Create user profile in Firestore
    await db.collection('users').doc(uid).set({
      uid: uid,
      phoneNumber: phoneNumber,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      role: 'user',
      isActive: true
    });

    console.log(`User profile created for UID: ${uid}`);
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
});

/**
 * On User Delete Trigger
 * Cleans up user data when account is deleted
 */
exports.onUserDelete = functions.auth.user().onDelete(async (user) => {
  const { uid } = user;

  try {
    // Delete user profile from Firestore
    await db.collection('users').doc(uid).delete();
    
    console.log(`User data cleaned up for UID: ${uid}`);
  } catch (error) {
    console.error('Error cleaning up user data:', error);
  }
});

// Export utility function for internal use
exports.verifyToken = verifyToken;
