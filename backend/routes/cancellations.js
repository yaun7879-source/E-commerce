const express = require('express');
const router = express.Router();
const cancellationController = require('../controllers/cancellationController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// POST create cancellation (authenticated)
router.post('/', auth.verifyToken, asyncHandler(cancellationController.createCancellation));

// GET user cancellations (authenticated)
router.get('/user/:userId', auth.verifyToken, asyncHandler(cancellationController.getUserCancellations));

// GET cancellation details (authenticated)
router.get('/:cancellationId', auth.verifyToken, asyncHandler(cancellationController.getCancellation));

// PUT update cancellation status (admin)
router.put('/:cancellationId', auth.verifyToken, role('admin'), asyncHandler(cancellationController.updateCancellationStatus));

module.exports = router;
