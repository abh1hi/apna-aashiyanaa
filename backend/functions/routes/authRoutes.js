const express = require('express');
const router = express.Router();
const {
  registerOrLoginWithPhone,
  loginWithPassword,
  checkAuthMethod,
} = require('../controllers/authController');

// Define the routes for user authentication
router.post('/phone', registerOrLoginWithPhone);

// Password-based login
router.post('/login/password', loginWithPassword);

// Check available authentication methods for a user
router.post('/check-auth-method', checkAuthMethod);

module.exports = router;
