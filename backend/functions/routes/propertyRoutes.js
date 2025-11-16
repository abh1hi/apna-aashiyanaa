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

// Image management routes - MUST come before /:id route to avoid conflicts
router.delete('/:id/images/:imageId', protect, propertyController.deletePropertyImage);
router.put('/:id/images/reorder', protect, propertyController.reorderPropertyImages);

// Parameterized route - MUST come last to avoid route collision
router.get('/:id', propertyController.getPropertyByIdOrSlug);

router.post(
    '/',
    protect,
    // Multer error handling middleware
    (err, req, res, next) => {
      if (err) {
        console.error('Multer error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Maximum size is 10MB per file.' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ error: 'Too many files. Maximum is 10 files.' });
        }
        if (err.message && err.message.includes('Unexpected end of form')) {
          return res.status(400).json({ error: 'Invalid form data. The request may be incomplete.' });
        }
        return res.status(400).json({ error: err.message || 'File upload error' });
      }
      next();
    },
    upload.array('images', 10), // 1. Multer middleware for parsing files
    // 2. Custom middleware for processing and getting URLs (only if files exist)
    async (req, res, next) => {
        try {
          if (req.files && req.files.length > 0) {
              // Files were uploaded, process them and get URLs
              return processAndAttachUrls('properties')(req, res, next);
          }
          // No files to process, but image URLs might be in req.body.images
          // Let parseFormDataJson handle parsing the images array
          next();
        } catch (error) {
          console.error('Error in file processing middleware:', error);
          next(error);
        }
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
