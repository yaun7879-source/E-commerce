const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyToken } = require('../middleware/auth');

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// GET cart for authenticated user
router.get('/', verifyToken, asyncHandler(cartController.getCart));

// POST add to cart
router.post('/add', verifyToken, asyncHandler(cartController.addToCart));

// PUT update cart item quantity
router.put('/update', verifyToken, asyncHandler(cartController.updateCartItem));

// DELETE remove from cart
router.delete('/:cartItemId', verifyToken, asyncHandler(cartController.removeFromCart));

// DELETE clear cart
router.delete('/clear', verifyToken, asyncHandler(cartController.clearCart));

module.exports = router;
