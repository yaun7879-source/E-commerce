const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// POST create order (authenticated)
router.post('/', auth.verifyToken, asyncHandler(orderController.createOrder));

// GET user orders (authenticated) - server will ensure user matches
router.get('/user/:userId', auth.verifyToken, asyncHandler(orderController.getUserOrders));

// GET order details (authenticated)
router.get('/:orderId', auth.verifyToken, asyncHandler(orderController.getOrderDetails));

// PUT update order status (authenticated - consider adding admin check)
router.put('/:orderId', auth.verifyToken, asyncHandler(orderController.updateOrderStatus));

module.exports = router;
