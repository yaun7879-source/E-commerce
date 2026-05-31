const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {
    registerValidation,
    loginValidation,
    profileUpdateValidation
} = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/register', registerValidation, asyncHandler(userController.registerUser));
router.post('/login', loginValidation, asyncHandler(userController.loginUser));
router.post('/forgot-password', asyncHandler(userController.requestPasswordReset));
router.post('/reset-password', asyncHandler(userController.resetPassword));
router.get('/:id', authMiddleware, asyncHandler(userController.getUserProfile));
router.put('/:id', authMiddleware, profileUpdateValidation, asyncHandler(userController.updateUserProfile));

module.exports = router;