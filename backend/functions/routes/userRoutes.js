const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Get user profile (requires authentication)
router.get('/profile', protect, getUserProfile);

// Update user profile (requires authentication)
router.put('/profile', protect, updateUserProfile);

module.exports = router;
