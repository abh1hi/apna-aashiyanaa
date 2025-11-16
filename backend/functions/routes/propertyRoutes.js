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
    // 2. Custom middleware for processing and getting URLs (only if files exist)
    (req, res, next) => {
        if (req.files && req.files.length > 0) {
            return processAndAttachUrls('properties')(req, res, next);
        }
        // No files to process, continue to validation
        req.body.images = [];
        next();
    },
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
