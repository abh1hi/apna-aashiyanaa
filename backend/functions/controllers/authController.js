const { validationResult } = require('express-validator');
const User = require('../models/User');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const functions = require('firebase-functions');

// Generates a JWT token for a given user ID.
const generateToken = (id) => {
  return jwt.sign({ id }, functions.config().jwt.secret, {
    expiresIn: '30d',
  });
};

// @desc    Register or Login user with phone number
// @route   POST /api/auth/phone
// @access  Public
const registerOrLoginWithPhone = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    res.status(400);
    throw new Error('ID token is required');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { phone_number: phoneNumber, uid: firebaseUid } = decodedToken;

    let user = await User.findByFirebaseUid(firebaseUid);

    if (user) {
      // User exists, log them in
      res.json({
        _id: user.id,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      // User does not exist, create a new user
      const { name } = req.body; // Or get name from other sources
      const newUser = {
        firebaseUid,
        mobile: phoneNumber,
        name,
        role: 'user',
      };
      
      const createdUser = await User.create(newUser);

      res.status(201).json({
        _id: createdUser.id,
        name: createdUser.name,
        mobile: createdUser.mobile,
        role: createdUser.role,
        token: generateToken(createdUser._id),
      });
    }
  } catch (error) {
    console.error('Error verifying ID token:', error);
    res.status(401).send('Unauthorized');
  }
});

// @desc    Login with password
// @route   POST /api/auth/login/password
// @access  Public
const loginWithPassword = asyncHandler(async (req, res) => {
  const { mobile, password } = req.body;

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

  // Return user data with token
  res.json({
    _id: user.id,
    name: user.name,
    mobile: user.mobile,
    aadhaar: user.aadhaar,
    role: user.role,
    token: generateToken(user._id),
  });
});

// @desc    Check if user has password set
// @route   POST /api/auth/check-auth-method
// @access  Public
const checkAuthMethod = asyncHandler(async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    res.status(400);
    throw new Error('Please provide mobile number');
  }

  const user = await User.findByPhone(mobile);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    mobile: user.mobile,
    hasPassword: !!user.password,
    availableMethods: user.password ? ['otp', 'password'] : ['otp'],
  });
});

module.exports = {
  registerOrLoginWithPhone,
  loginWithPassword,
  checkAuthMethod,
};