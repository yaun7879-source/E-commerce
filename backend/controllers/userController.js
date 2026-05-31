const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { getPool } = require('../config/db');
const { sendMail } = require('../utils/mail');

const sendPasswordResetEmail = async (email, token) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    await sendMail({
        to: email,
        subject: 'Password Reset Request',
        html: `<p>You requested a password reset.</p>
               <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
               <p>If you did not request this, ignore this email.</p>`
    });
};

exports.registerUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const { email, password, first_name, last_name } = req.body;
        const pool = await getPool();
        const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, first_name, last_name]
        );

        res.status(201).json({
            message: 'User registered successfully',
            userId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const { email, password } = req.body;
        const pool = await getPool();
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        if (user.locked_until && new Date(user.locked_until) > new Date()) {
            const remainingTime = Math.ceil((new Date(user.locked_until) - new Date()) / 1000 / 60);
            return res.status(429).json({
                error: `Account is locked. Try again in ${remainingTime} minutes.`
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            const newFailedAttempts = (user.failed_login_attempts || 0) + 1;
            let lockedUntil = null;

            if (newFailedAttempts >= 5) {
                lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
                await pool.query(
                    'UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?',
                    [newFailedAttempts, lockedUntil, user.id]
                );
                return res.status(429).json({
                    error: 'Too many failed attempts. Account locked for 30 minutes.'
                });
            }

            await pool.query(
                'UPDATE users SET failed_login_attempts = ? WHERE id = ?',
                [newFailedAttempts, user.id]
            );
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        await pool.query(
            'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?',
            [user.id]
        );

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role || 'customer' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role || 'customer'
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const pool = await getPool();
        const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);

        if (users.length > 0) {
            const resetToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
            const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

            await pool.query(
                'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
                [hashedToken, expiresAt, email]
            );

            await sendPasswordResetEmail(email, resetToken);
        }

        res.json({ message: 'If an account exists at that email, reset instructions were sent.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ error: 'Reset token and new password are required' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const pool = await getPool();
        const [users] = await pool.query(
            'SELECT id, reset_token_expiry FROM users WHERE reset_token = ?',
            [hashedToken]
        );

        if (users.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        const user = users[0];
        if (!user.reset_token_expiry || new Date(user.reset_token_expiry) < new Date()) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );

        res.json({ message: 'Password reset successfully. Please sign in.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const pool = await getPool();
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        if (parseInt(id) !== userId && userRole !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: You can only view your own profile' });
        }

        const [users] = await pool.query(
            'SELECT id, email, first_name, last_name, phone, address, city, zip_code FROM users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const pool = await getPool();
        const { id } = req.params;
        const userId = req.user.id;

        if (parseInt(id) !== userId) {
            return res.status(403).json({ error: 'Forbidden: You can only update your own profile' });
        }

        const { first_name, last_name, phone, address, city, zip_code } = req.body;

        await pool.query(
            'UPDATE users SET first_name = ?, last_name = ?, phone = ?, address = ?, city = ?, zip_code = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [first_name, last_name, phone, address, city, zip_code, id]
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};