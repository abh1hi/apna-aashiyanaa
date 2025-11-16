const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { protect } = require('../middleware/authMiddleware');
const { propertyValidationRules, validate } = require('../middleware/validation');
const { upload, processAndAttachUrls } = require('../middleware/filesUploadMiddleware');

// Public routes
router.get('/', propertyController.getProperties);
router.get('/search', propertyController.searchProperties);
router.get('/:id', propertyController.getPropertyByIdOrSlug);

// Private routes
router.get('/user/my-properties', protect, propertyController.getUserProperties);

router.post(
    '/',
    protect,
    upload.array('images', 10), // 1. Multer middleware for parsing files
    processAndAttachUrls('properties'), // 2. Custom middleware for processing and getting URLs
    propertyValidationRules(),
    validate, 
    propertyController.createProperty
);

router.put(
    '/:id',
    protect,
    upload.array('images', 10),
    processAndAttachUrls('properties'),
    propertyController.updateProperty
);

router.delete('/:id', protect, propertyController.deleteProperty);

module.exports = router;
