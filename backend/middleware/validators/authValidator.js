const { body } = require('express-validator');

const registerValidationRules = () => {
  return [
    body('name').notEmpty().withMessage('Name is required').trim().escape(),
    body('mobile').isMobilePhone('any').withMessage('Please include a valid mobile number'),
    body('aadhaar').isLength({ min: 12, max: 12 }).withMessage('Aadhaar must be 12 digits long').optional({ checkFalsy: true }),
  ];
};

const loginValidationRules = () => {
  return [
    body('mobile').isMobilePhone('any').withMessage('Please include a valid mobile number'),
  ];
};

module.exports = {
  registerValidationRules,
  loginValidationRules,
};