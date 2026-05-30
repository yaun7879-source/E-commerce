const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const verifyToken = require('../middleware/auth');

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Get all reviews across products - public
router.get('/', asyncHandler(reviewController.getAllReviews));

// Get review summary for all products - public
router.get('/summary', asyncHandler(reviewController.getReviewSummary));

// Get reviews for a specific product - public
router.get('/product/:productId', asyncHandler(reviewController.getReviewsByProductId));

// Add a new review for a product - authenticated only
router.post('/product/:productId', verifyToken, asyncHandler(reviewController.createReview));

module.exports = router;
