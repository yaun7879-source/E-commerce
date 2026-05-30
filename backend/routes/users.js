const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { registerValidator, loginValidator, profileUpdateValidator } = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// POST register user
router.post('/register', registerValidator, asyncHandler(userController.registerUser));

// POST login user
router.post('/login', loginValidator, asyncHandler(userController.loginUser));

// POST forgot password request
router.post('/forgot-password', asyncHandler(userController.requestPasswordReset));

// POST reset password confirmation
router.post('/reset-password', asyncHandler(userController.resetPassword));

// GET user profile
router.get('/:id', authMiddleware, asyncHandler(userController.getUserProfile));

// PUT update user profile
router.put('/:id', authMiddleware, profileUpdateValidator, asyncHandler(userController.updateUserProfile));

module.exports = router;
