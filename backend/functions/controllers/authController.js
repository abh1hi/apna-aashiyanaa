const User = require('../models/User');
const admin = require('firebase-admin');
const asyncHandler = require('express-async-handler');

/**
 * @desc    Register or Login user based on a verified Firebase ID token.
 * @route   POST /api/auth/phone
 * @access  Public
 * @note    This is the primary endpoint for both registration and login.
 *          The client is expected to handle the entire Firebase Auth flow (e.g., OTP)
 *          and send the resulting ID token here.
 */
const registerOrLoginWithPhone = asyncHandler(async (req, res) => {
  // The 'email' field has been removed as it is not collected by the client.
  const { idToken, name, aadhaar } = req.body;

  if (!idToken) {
    res.status(400);
    throw new Error('Firebase ID token is required.');
  }

  try {
    // Verify the Firebase ID token using the Firebase Admin SDK.
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { phone_number: phoneNumber, uid: firebaseUid } = decodedToken;

    if (!firebaseUid || !phoneNumber) {
      res.status(400);
      throw new Error('The provided token is missing required user information.');
    }

    // Check if the user already exists in our database.
    let user = await User.findByFirebaseUid(firebaseUid);

    if (user) {
      // User exists, so this is a login.
      // We can optionally update their profile info if new data is provided.
      const updates = {};
      if (name && user.name !== name) updates.name = name;
      if (Object.keys(updates).length > 0) {
        user = await User.update(user.id, updates);
      }

      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: user, // Send the full user profile from the database
        isNewUser: false,
      });

    } else {
      // User does not exist, so this is a registration.
      const userData = {
        firebaseUid,
        phone: phoneNumber,
        name: name || null,
        aadhaar: aadhaar || null,
        role: 'user', // Default role for new users
      };

      const newUser = await User.create(userData);

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: newUser, // Send the newly created user profile
        isNewUser: true,
      });
    }
  } catch (error) {
    console.error('Error during Firebase token verification or user creation:', error);

    // Handle specific Firebase auth errors
    if (error.code === 'auth/id-token-expired') {
      res.status(401);
      throw new Error('Your session has expired. Please sign in again.');
    } else if (error.code === 'auth/invalid-id-token') {
      res.status(401);
      throw new Error('Invalid authentication token. Please sign in again.');
    }

    // Handle database or other errors
    res.status(500);
    throw new Error(error.message || 'An internal error occurred during authentication.');
  }
});

module.exports = {
  registerOrLoginWithPhone,
};
