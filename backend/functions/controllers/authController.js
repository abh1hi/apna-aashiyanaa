const User = require('../models/User');
const admin = require('firebase-admin');
const asyncHandler = require('express-async-handler');

// @desc    Register or Login user with phone number
// @route   POST /api/auth/phone
// @route   POST /api/auth/register
// @access  Public
const registerOrLoginWithPhone = asyncHandler(async (req, res) => {
  const {idToken, name, aadhaar, email} = req.body;

  if (!idToken) {
    res.status(400);
    throw new Error('ID token is required');
  }

  try {
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const {phone_number: phoneNumber, uid: firebaseUid} = decodedToken;

    // Check if user already exists
    let user = await User.findByFirebaseUid(firebaseUid);

    if (user) {
      // User exists, return existing user info
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          firebaseUid: user.firebaseUid,
          phone: user.phone || phoneNumber,
          name: user.name,
          email: user.email,
          aadhaar: user.aadhaar,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt
        },
        isNewUser: false
      });
    } else {
      // User does not exist, create a new user
      const userData = {
        firebaseUid,
        phone: phoneNumber,
        name: name || null,
        email: email || null,
        aadhaar: aadhaar || null,
        role: 'user',
      };

      const createdUser = await User.create(userData);

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: {
          id: createdUser.id,
          firebaseUid: createdUser.firebaseUid,
          phone: createdUser.phone,
          name: createdUser.name,
          email: createdUser.email,
          aadhaar: createdUser.aadhaar,
          role: createdUser.role,
          isActive: createdUser.isActive,
          createdAt: createdUser.createdAt
        },
        isNewUser: true
      });
    }
  } catch (error) {
    console.error('Error during registration/login:', error);
    
    if (error.code === 'auth/id-token-expired') {
      res.status(401);
      throw new Error('Token expired. Please sign in again.');
    }
    
    if (error.code === 'auth/invalid-id-token') {
      res.status(401);
      throw new Error('Invalid token. Please sign in again.');
    }
    
    res.status(500);
    throw new Error('Registration/Login failed: ' + error.message);
  }
});

// @desc    Login with password
// @route   POST /api/auth/login/password
// @access  Public
const loginWithPassword = asyncHandler(async (req, res) => {
  const {mobile, password} = req.body;

  if (!mobile || !password) {
    res.status(400);
    throw new Error('Please provide mobile and password');
  }

  const user = await User.findByPhone(mobile);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if user has a password set
  if (!user.password) {
    res.status(400);
    throw new Error('Password login not available. Please use OTP login.');
  }

  // Verify password
  const isPasswordMatch = await User.verifyPassword(password, user.password);

  if (!isPasswordMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Create custom Firebase token for this user
  const customToken = await admin.auth().createCustomToken(user.firebaseUid);

  // Return user data with custom token
  res.json({
    success: true,
    message: 'Login successful',
    user: {
      id: user.id,
      firebaseUid: user.firebaseUid,
      name: user.name,
      phone: user.phone,
      aadhaar: user.aadhaar,
      role: user.role,
    },
    customToken // Client should use this to signInWithCustomToken
  });
});

// @desc    Check if user has password set
// @route   POST /api/auth/check-auth-method
// @access  Public
const checkAuthMethod = asyncHandler(async (req, res) => {
  const {mobile} = req.body;

  if (!mobile) {
    res.status(400);
    throw new Error('Please provide mobile number');
  }

  const user = await User.findByPhone(mobile);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  res.json({
    success: true,
    mobile: user.phone,
    hasPassword: !!user.password,
    availableMethods: user.password ? ['otp', 'password'] : ['otp'],
  });
});

module.exports = {
  registerOrLoginWithPhone,
  loginWithPassword,
  checkAuthMethod,
};
