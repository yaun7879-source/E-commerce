const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/auth');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * OAuth Authentication Routes
 * Handles Google and Facebook OAuth login/signup flows
 */
const router = express.Router();

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Google OAuth Routes
 */

/**
 * Initiates Google OAuth login flow
 * Route: GET /api/auth/google
 * Frontend redirects user to: {BACKEND_URL}/api/auth/google
 */
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

/**
 * Google OAuth callback URL
 * Route: GET /api/auth/google/callback
 * Google redirects user here after authentication
 * Handles user creation and JWT token generation
 */
router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${FRONTEND_URL}/login?error=google_auth_failed`,
        session: false
    }),
    asyncHandler(authController.googleCallback)
);

/**
 * Facebook OAuth Routes
 */

/**
 * Initiates Facebook OAuth login flow
 * Route: GET /api/auth/facebook
 * Frontend redirects user to: {BACKEND_URL}/api/auth/facebook
 */
router.get(
    '/facebook',
    passport.authenticate('facebook', {
        scope: ['email', 'public_profile']
    })
);

/**
 * Facebook OAuth callback URL
 * Route: GET /api/auth/facebook/callback
 * Facebook redirects user here after authentication
 * Handles user creation and JWT token generation
 */
router.get(
    '/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: `${FRONTEND_URL}/login?error=facebook_auth_failed`,
        session: false
    }),
    asyncHandler(authController.facebookCallback)
);

/**
 * Get authenticated user's profile
 * Route: GET /api/auth/profile
 * Requires: Valid JWT token in Authorization header
 */
router.get('/profile', verifyToken, asyncHandler(authController.getUserProfile));

/**
 * Logout endpoint
 * Route: POST /api/auth/logout
 * Clears user session
 */
router.post('/logout', verifyToken, asyncHandler(authController.logout));

module.exports = router;
