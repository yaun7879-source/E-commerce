const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * OAuth Authentication Controller
 * Handles Google and Facebook OAuth login/signup
 */

/**
 * Find or create user during OAuth login
 * @param {Object} profile - OAuth profile from Passport
 * @param {string} provider - OAuth provider (google or facebook)
 * @returns {Object} User object
 */
const findOrCreateUser = async (profile, provider) => {
    try {
        const pool = await getPool();
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : profile.email;

        if (!email) {
            throw new Error('Email not provided by OAuth provider');
        }

        // Check if user already exists by email
        const [existingUsers] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            // User exists, return user
            return existingUsers[0];
        }

        // Create new user from OAuth profile
        const firstName = profile.name ? profile.name.givenName || '' : '';
        const lastName = profile.name ? profile.name.familyName || '' : '';
        const displayName = profile.displayName || profile.name?.familyName || '';

        // Insert new user
        const [result] = await pool.query(
            'INSERT INTO users (email, first_name, last_name, password) VALUES (?, ?, ?, ?)',
            [
                email,
                firstName || displayName || 'OAuth User',
                lastName || '',
                'oauth' // Dummy password for OAuth users (never used)
            ]
        );

        // Return the newly created user
        const [newUser] = await pool.query(
            'SELECT * FROM users WHERE id = ?',
            [result.insertId]
        );

        return newUser[0];
    } catch (error) {
        console.error('❌ Error in findOrCreateUser:', error);
        throw error;
    }
};

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateToken = (user) => {
    try {
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        return token;
    } catch (error) {
        console.error('❌ Error generating JWT token:', error);
        throw error;
    }
};

/**
 * Google OAuth Callback Handler
 * Route: /api/auth/google/callback
 */
exports.googleCallback = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication failed' });
        }

        // Find or create user
        const user = await findOrCreateUser(req.user, 'google');

        // Generate JWT token
        const token = generateToken(user);

        // Set token in an HttpOnly cookie to avoid exposure in browser history
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            maxAge: 24 * 60 * 60 * 1000
        };

        res.cookie('token', token, cookieOptions);

        // Redirect to frontend with minimal info (no token in URL)
        const redirectUrl = new URL(`${FRONTEND_URL}/login`);
        redirectUrl.searchParams.set('id', user.id);
        redirectUrl.searchParams.set('email', user.email);
        redirectUrl.searchParams.set('first_name', user.first_name || '');
        redirectUrl.searchParams.set('last_name', user.last_name || '');
        if (user.phone) redirectUrl.searchParams.set('phone', user.phone);

        res.redirect(redirectUrl.toString());
    } catch (error) {
        console.error('❌ Error in googleCallback:', error);
        res.status(500).json({
            error: 'Authentication failed',
            message: error.message
        });
    }
};

/**
 * Facebook OAuth Callback Handler
 * Route: /api/auth/facebook/callback
 */
exports.facebookCallback = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication failed' });
        }

        // Find or create user
        const user = await findOrCreateUser(req.user, 'facebook');

        // Generate JWT token
        const token = generateToken(user);

        // Set token in an HttpOnly cookie to avoid exposure in browser history
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            maxAge: 24 * 60 * 60 * 1000
        };

        res.cookie('token', token, cookieOptions);

        // Redirect to frontend with minimal info (no token in URL)
        const redirectUrl = new URL(`${FRONTEND_URL}/login`);
        redirectUrl.searchParams.set('id', user.id);
        redirectUrl.searchParams.set('email', user.email);
        redirectUrl.searchParams.set('first_name', user.first_name || '');
        redirectUrl.searchParams.set('last_name', user.last_name || '');
        if (user.phone) redirectUrl.searchParams.set('phone', user.phone);

        res.redirect(redirectUrl.toString());
    } catch (error) {
        console.error('❌ Error in facebookCallback:', error);
        res.status(500).json({
            error: 'Authentication failed',
            message: error.message
        });
    }
};

/**
 * Get user profile from OAuth session
 * Route: /api/auth/profile
 */
exports.getUserProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.json({ user: null });
        }

        const pool = await getPool();
        const [users] = await pool.query(
            'SELECT id, email, first_name, last_name, phone FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: users[0]
        });
    } catch (error) {
        console.error('❌ Error in getUserProfile:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Logout user (for OAuth sessions)
 * Route: /api/auth/logout
 */
exports.logout = (req, res) => {
    try {
        req.logout((err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Logged out successfully' });
        });
    } catch (error) {
        console.error('❌ Error in logout:', error);
        res.status(500).json({ error: error.message });
    }
};
