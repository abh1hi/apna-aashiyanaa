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
    // 2. Custom middleware for processing and getting URLs (only if files exist)
    async (req, res, next) => {
        if (req.files && req.files.length > 0) {
            // Files were uploaded, process them and get URLs
            return processAndAttachUrls('properties')(req, res, next);
        }
        // No files to process, but image URLs might be in req.body.images
        // Let parseFormDataJson handle parsing the images array
        next();
    },
    parseFormDataJson, // This will parse images from FormData if they're URLs
    propertyValidationRules(),
    validate, 
    propertyController.createProperty
);

router.put(
    '/:id',
    protect,
    upload.array('images', 10),
    // Only process images if new ones are uploaded
    (req, res, next) => {
        if (req.files && req.files.length > 0) {
            return processAndAttachUrls('properties')(req, res, next);
        }
        next();
    },
    propertyController.updateProperty
);

router.delete('/:id', protect, propertyController.deleteProperty);

module.exports = router;
