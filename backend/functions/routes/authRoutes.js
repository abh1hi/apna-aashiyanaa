const express = require('express');
const router = express.Router();
const {
  registerOrLoginWithPhone,
} = require('../controllers/authController');

// This single endpoint handles both user registration and login.
// The client sends a Firebase ID token, and the controller determines
// whether to create a new user or log in an existing one.
router.post('/phone', registerOrLoginWithPhone);

module.exports = router;
