const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/create-order', verifyToken, asyncHandler(paymentController.createOrder));
router.post('/verify', verifyToken, asyncHandler(paymentController.verifyPayment));

module.exports = router;
