// User input validation using express-validator
const { body } = require('express-validator');

// Strong password pattern: min 12 chars, at least 1 uppercase, 1 number, 1 special char
// ✅ Naya
const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

body('password')
    .isLength({ min: 8 })

exports.registerValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Invalid email address'),
    body('password')
        .isLength({ min: 12 })
        .withMessage('Password must be at least 12 characters')
        .matches(passwordPattern)
        .withMessage('Password must contain uppercase letter, number, and special character (@$!%*?&)'),
    body('first_name')
        .trim()
        .notEmpty()
        .withMessage('First name is required')
        .isLength({ max: 100 })
        .withMessage('First name must be less than 100 characters'),
    body('last_name')
        .trim()
        .optional()
        .isLength({ max: 100 })
        .withMessage('Last name must be less than 100 characters'),
];

exports.loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Invalid email address'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

exports.profileUpdateValidation = [
    body('first_name')
        .trim()
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('First name must be 1-100 characters'),
    body('last_name')
        .trim()
        .optional()
        .isLength({ max: 100 })
        .withMessage('Last name must be less than 100 characters'),
    body('phone')
        .trim()
        .optional()
        .matches(/^[0-9+\-\s()]*$/)
        .isLength({ min: 7, max: 20 })
        .withMessage('Invalid phone number format'),
    body('address')
        .trim()
        .optional()
        .isLength({ max: 500 })
        .withMessage('Address must be less than 500 characters'),
    body('city')
        .trim()
        .optional()
        .isLength({ max: 100 })
        .withMessage('City must be less than 100 characters'),
    body('zip_code')
        .trim()
        .optional()
        .matches(/^[0-9\s\-]{3,10}$/)
        .withMessage('Invalid postal code format'),
];
