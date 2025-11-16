const express = require('express');
const router = express.Router();
const {
  createProperty,
  getProperties,
  getPropertyById,
} = require('../controllers/propertyController');
const { protect } = require('../middleware/authMiddleware');

// Public route to get all properties
router.get('/', getProperties);

// Public route to get a single property by ID
router.get('/:id', getPropertyById);

// Private route to create a new property
// The 'protect' middleware ensures only authenticated users can access this
router.post('/', protect, createProperty);

module.exports = router;
