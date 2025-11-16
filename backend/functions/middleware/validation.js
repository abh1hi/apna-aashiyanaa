const {body, validationResult} = require('express-validator');

// Validation rules for property creation
const propertyValidationRules = () => {
  return [
    body('title')
        .trim()
        .isLength({min: 5, max: 100})
        .withMessage('Title must be between 5 and 100 characters'),

    body('description')
        .trim()
        .isLength({min: 20, max: 1000})
        .withMessage('Description must be between 20 and 1000 characters'),

    body('price')
        .isFloat({min: 0})
        .withMessage('Price must be a positive number'),

    body('location.address')
        .trim()
        .isLength({min: 10})
        .withMessage('Location address must be at least 10 characters'),

    body('location.city')
        .optional()
        .trim()
        .isLength({min: 2})
        .withMessage('City must be at least 2 characters'),

    body('location.state')
        .optional()
        .trim()
        .isLength({min: 2})
        .withMessage('State must be at least 2 characters'),

    body('location.country')
        .optional()
        .trim()
        .isLength({min: 2})
        .withMessage('Country must be at least 2 characters'),

    body('location.pinCode')
        .optional()
        .trim()
        .isLength({min: 4, max: 10})
        .withMessage('Pin code must be between 4 and 10 characters'),

    body('propertyType')
        .isIn(['apartment', 'house', 'land', 'commercial'])
        .withMessage('Invalid property type'),

    body('bedrooms')
        .isInt({min: 0})
        .withMessage('Bedrooms must be a non-negative integer'),

    body('bathrooms')
        .isFloat({min: 0})
        .withMessage('Bathrooms must be a non-negative number'),

    body('area')
        .isFloat({min: 0})
        .withMessage('Area must be a positive number'),

    body('location.latitude')
        .optional()
        .isFloat({min: -90, max: 90})
        .withMessage('Latitude must be between -90 and 90'),

    body('location.longitude')
        .optional()
        .isFloat({min: -180, max: 180})
        .withMessage('Longitude must be between -180 and 180'),

    body('amenities')
        .optional()
        .isArray()
        .withMessage('Amenities must be an array'),

    body('images')
        .optional()
        .isArray()
        .withMessage('Images must be an array'),
  ];
};

// Middleware to handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = {
  propertyValidationRules,
  validate,
};
