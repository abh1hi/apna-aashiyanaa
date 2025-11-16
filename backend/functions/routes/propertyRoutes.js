const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { protect } = require('../middleware/authMiddleware');
const { propertyValidationRules, validate } = require('../middleware/validation');
const filesUploadMiddleware = require('../middleware/filesUploadMiddleware');

// Public routes
router.get('/', propertyController.getProperties);
router.get('/:id', propertyController.getPropertyByIdOrSlug);

// Private routes
router.post(
    '/',
    protect,
    filesUploadMiddleware('images', 'properties'), 
    propertyValidationRules(),
    validate, 
    propertyController.createProperty
);

router.put(
    '/:id',
    protect,
    filesUploadMiddleware('images', 'properties'),
    propertyController.updateProperty
);

router.delete('/:id', protect, propertyController.deleteProperty);

module.exports = router;
