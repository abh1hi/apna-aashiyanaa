const { validationResult } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

// Generates a JWT token for a given user ID.
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP (dummy function for now)
const sendOTP = async (mobile, otp) => {
  console.log(`Sending OTP ${otp} to ${mobile}`);
  // TODO: Integrate with an actual SMS gateway like Twilio or MessageBird
};

// @desc    Register user with mobile + Aadhaar + Password (optional)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, mobile, aadhaar, password } = req.body;

  const userExists = await User.findOne({ mobile });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const otp = generateOTP();
  await sendOTP(mobile, otp);

  // Create user with default role 'buyer' (set by schema)
  const userData = {
    name,
    mobile,
    aadhaar,
    otp,
    otpExpires: Date.now() + 10 * 60 * 1000, // OTP valid for 10 minutes
  };

  // Add password if provided
  if (password) {
    userData.password = password;
  }

  const user = await User.create(userData);

  if (user) {
    res.status(201).json({
      message: 'OTP sent to mobile number',
      userId: user._id,
      hasPassword: !!password, // Indicate if user set a password
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Login with mobile (sends OTP)
// @route   POST /api/auth/login/otp
// @access  Public
const loginWithOTP = asyncHandler(async (req, res) => {
  const { mobile } = req.body;

  const user = await User.findOne({ mobile });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const otp = generateOTP();
  await sendOTP(mobile, otp);

  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
  await user.save();

  res.status(200).json({ 
    message: 'OTP sent to mobile number', 
    userId: user._id 
  });
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

  // Find user and include password field
  const user = await User.findOne({ mobile }).select('+password');

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
  const isPasswordMatch = await user.matchPassword(password);

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

// @desc    OTP verification
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.otp !== otp || user.otpExpires < Date.now()) {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

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

  const user = await User.findOne({ mobile }).select('+password');

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

// @desc    Create a new user
// @route   POST /api/auth/create-user
// @access  Public
const createUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, mobile, password } = req.body;

  const userExists = await User.findOne({ mobile });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const userData = {
    name,
    mobile,
  };

  if (password) {
    userData.password = password;
  }

  const user = await User.create(userData);

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      mobile: user.mobile,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

module.exports = {
  registerUser,
  loginWithOTP,
  loginWithPassword,
  verifyOTP,
  checkAuthMethod,
  createUser,
};
