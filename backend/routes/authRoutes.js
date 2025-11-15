const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginWithOTP, 
  loginWithPassword, 
  verifyOTP,
  checkAuthMethod,
  createUser
} = require('../controllers/authController');
const { registerValidationRules, loginValidationRules } = require('../middleware/validators/authValidator');

// Define the routes for user authentication
router.post('/register', registerValidationRules(), registerUser);

// OTP-based login
router.post('/login/otp', loginValidationRules(), loginWithOTP);

// Password-based login
router.post('/login/password', loginWithPassword);

// OTP verification (for both registration and OTP login)
router.post('/verify-otp', verifyOTP);

// Check available authentication methods for a user
router.post('/check-auth-method', checkAuthMethod);

// Create a new user
router.post('/create-user', registerValidationRules(), createUser);

module.exports = router;
