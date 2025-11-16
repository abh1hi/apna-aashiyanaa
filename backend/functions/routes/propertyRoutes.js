const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { protect } = require('../middleware/authMiddleware');
const { propertyValidationRules, validate, parseFormDataJson } = require('../middleware/validation');
const { upload, processAndAttachUrls } = require('../middleware/filesUploadMiddleware');

// Public routes
router.get('/', propertyController.getProperties);
router.get('/search', propertyController.searchProperties);

// Private routes - MUST come before parameterized routes
router.get('/user/my-properties', protect, propertyController.getUserProperties);

// Parameterized route - MUST come last to avoid route collision
router.get('/:id', propertyController.getPropertyByIdOrSlug);

router.post(
    '/',
    protect,
    upload.array('images', 10), // 1. Multer middleware for parsing files
    // 2. Custom middleware for processing and getting URLs (always call)
    processAndAttachUrls('properties'),
    parseFormDataJson,
    propertyValidationRules(),
    validate, 
    propertyController.createProperty
);

router.put(
    '/:id',
    protect,
    upload.array('images', 10),
    // Always process images (middleware handles empty files)
    processAndAttachUrls('properties'),
    propertyController.updateProperty
);

router.delete('/:id', protect, propertyController.deleteProperty);

module.exports = router;
