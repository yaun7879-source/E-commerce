const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// POST register user
router.post('/register', userController.registerUser);

// POST login user
router.post('/login', userController.loginUser);

// GET user profile
router.get('/:id', userController.getUserProfile);

// PUT update user profile
router.put('/:id', userController.updateUserProfile);

module.exports = router;
