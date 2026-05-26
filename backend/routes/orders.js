const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// POST create order
router.post('/', orderController.createOrder);

// GET user orders
router.get('/user/:userId', orderController.getUserOrders);

// GET order details
router.get('/:orderId', orderController.getOrderDetails);

// PUT update order status
router.put('/:orderId', orderController.updateOrderStatus);

module.exports = router;
