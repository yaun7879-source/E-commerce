const express = require('express');
const router = express.Router();
const returnController = require('../controllers/returnController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// POST create return (authenticated)
router.post('/', auth.verifyToken, asyncHandler(returnController.createReturn));

// GET user returns (authenticated)
router.get('/user/:userId', auth.verifyToken, asyncHandler(returnController.getUserReturns));

// GET return details (authenticated)
router.get('/:returnId', auth.verifyToken, asyncHandler(returnController.getReturn));

// PUT update return status (admin)
router.put('/:returnId', auth.verifyToken, role('admin'), asyncHandler(returnController.updateReturnStatus));

module.exports = router;
