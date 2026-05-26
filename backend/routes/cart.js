const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyToken } = require('../middleware/auth');

// GET cart for authenticated user
router.get('/', verifyToken, cartController.getCart);

// POST add to cart
router.post('/add', verifyToken, cartController.addToCart);

// PUT update cart item quantity
router.put('/update', verifyToken, cartController.updateCartItem);

// DELETE remove from cart
router.delete('/:cartItemId', verifyToken, cartController.removeFromCart);

// DELETE clear cart
router.delete('/clear', verifyToken, cartController.clearCart);

module.exports = router;
