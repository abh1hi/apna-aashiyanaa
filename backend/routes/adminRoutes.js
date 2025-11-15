const express = require('express');
const router = express.Router();
const {
  getUsers,
  getAdminProperties,
  approveProperty,
  rejectProperty,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes in this file are protected by admin middleware
router.use(protect, admin);

// User management
router.route('/users').get(getUsers);

// Property management
router.route('/properties').get(getAdminProperties);
router.route('/properties/:id/approve').put(approveProperty);
router.route('/properties/:id/reject').put(rejectProperty);

module.exports = router;
