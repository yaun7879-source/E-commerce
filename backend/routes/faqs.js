const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// GET all FAQs (public)
router.get('/', asyncHandler(faqController.getAllFAQs));

// GET FAQs by category (public)
router.get('/category/:category', asyncHandler(faqController.getFAQsByCategory));

// GET single FAQ (public)
router.get('/:faqId', asyncHandler(faqController.getFAQ));

// POST create FAQ (admin)
router.post('/', auth.verifyToken, role('admin'), asyncHandler(faqController.createFAQ));

// PUT update FAQ (admin)
router.put('/:faqId', auth.verifyToken, role('admin'), asyncHandler(faqController.updateFAQ));

// DELETE FAQ (admin)
router.delete('/:faqId', auth.verifyToken, role('admin'), asyncHandler(faqController.deleteFAQ));

module.exports = router;
