const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/role');

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// GET all products - public
router.get('/', asyncHandler(productController.getAllProducts));

// GET product by ID - public
router.get('/:id', asyncHandler(productController.getProductById));

// POST create product - admin only
router.post('/', verifyToken, checkRole('admin'), asyncHandler(productController.createProduct));

// PUT update product - admin only
router.put('/:id', verifyToken, checkRole('admin'), asyncHandler(productController.updateProduct));

// DELETE product - admin only
router.delete('/:id', verifyToken, checkRole('admin'), asyncHandler(productController.deleteProduct));

module.exports = router;
