const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { protect } = require('../middleware/authMiddleware');
const { propertyValidationRules, validate } = require('../middleware/validation');

// Public routes for fetching properties
router.get('/', propertyController.getProperties);
router.get('/search', propertyController.searchProperties);
router.get('/:id', propertyController.getPropertyById);

// Private routes for managing properties
router.get('/user/my-properties', protect, propertyController.getUserProperties);

// Create property with images
router.post(
  '/',
  protect,
  propertyValidationRules(),
  validate,
  propertyController.createProperty
);

// Update property with optional new images
router.put(
  '/:id',
  protect,
  propertyController.updateProperty
);

// Upload images to existing property
router.post(
  '/:id/images',
  protect,
  propertyController.uploadPropertyImages
);

// Delete specific image from property
router.delete(
  '/:id/images/:imageIndex',
  protect,
  propertyController.deletePropertyImage
);

// Delete property
router.delete('/:id', protect, propertyController.deleteProperty);

module.exports = router;
