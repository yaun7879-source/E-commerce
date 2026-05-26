const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Get all reviews across products
router.get('/', reviewController.getAllReviews);

// Get review summary for all products
router.get('/summary', reviewController.getReviewSummary);

// Get reviews for a specific product
router.get('/product/:productId', reviewController.getReviewsByProductId);

// Add a new review for a product
router.post('/product/:productId', reviewController.createReview);

module.exports = router;
