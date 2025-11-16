const {body, validationResult} = require('express-validator');

// Custom middleware to parse JSON fields in FormData
const parseFormDataJson = (req, res, next) => {
  try {
    // Parse stringified location if present
    if (req.body.location && typeof req.body.location === 'string') {
      req.body.location = JSON.parse(req.body.location);
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Validation rules for property creation
const propertyValidationRules = () => {
  return [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({min: 5, max: 100})
        .withMessage('Title must be between 5 and 100 characters'),

    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({min: 20, max: 1000})
        .withMessage('Description must be between 20 and 1000 characters'),

    body('price')
        .notEmpty().withMessage('Price is required')
        .isFloat({min: 0})
        .withMessage('Price must be a positive number'),

    body('location.address')
        .if(req => req.body.location)
        .trim()
        .notEmpty().withMessage('Address is required')
        .isLength({min: 10})
        .withMessage('Location address must be at least 10 characters'),

    body('location.city')
        .if(req => req.body.location)
        .trim()
        .notEmpty().withMessage('City is required')
        .isLength({min: 2})
        .withMessage('City must be at least 2 characters'),

    body('location.state')
        .if(req => req.body.location)
        .trim()
        .notEmpty().withMessage('State is required')
        .isLength({min: 2})
        .withMessage('State must be at least 2 characters'),

    body('location.country')
        .if(req => req.body.location)
        .trim()
        .notEmpty().withMessage('Country is required')
        .isLength({min: 2})
        .withMessage('Country must be at least 2 characters'),

    body('location.pinCode')
        .if(req => req.body.location)
        .trim()
        .notEmpty().withMessage('Pin code is required')
        .isLength({min: 4, max: 10})
        .withMessage('Pin code must be between 4 and 10 characters'),

    body('propertyType')
        .notEmpty().withMessage('Property type is required')
        .isIn(['apartment', 'house', 'land', 'commercial', 'villa'])
        .withMessage('Invalid property type. Must be one of: apartment, house, land, commercial, villa'),

    body('bedrooms')
        .notEmpty().withMessage('Bedrooms is required')
        .isInt({min: 0})
        .withMessage('Bedrooms must be a non-negative integer'),

    body('bathrooms')
        .notEmpty().withMessage('Bathrooms is required')
        .isFloat({min: 0})
        .withMessage('Bathrooms must be a non-negative number'),

    body('area')
        .notEmpty().withMessage('Area is required')
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
        .if(req => typeof req.body.amenities === 'string')
        .custom(val => typeof val === 'string')
        .withMessage('Amenities should be a string (comma-separated)'),

    body('images')
        .optional(),
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
  parseFormDataJson,
};
