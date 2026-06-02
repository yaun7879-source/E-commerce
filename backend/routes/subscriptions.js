const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { verifyToken } = require('../middleware/auth');

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Check if user is subscribed - authenticated only
router.get('/status', verifyToken, asyncHandler(subscriptionController.checkSubscription));

// Subscribe - authenticated only
router.post('/subscribe', verifyToken, asyncHandler(subscriptionController.subscribe));

// Unsubscribe - authenticated only
router.post('/unsubscribe', verifyToken, asyncHandler(subscriptionController.unsubscribe));

module.exports = router;
