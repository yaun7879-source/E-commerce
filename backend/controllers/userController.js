const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');

// Register user
exports.registerUser = async (req, res) => {
    try {
        const { email, password, first_name, last_name } = req.body;

        // Check if user exists
        const pool = await getPool();
        const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const [result] = await pool.query(
            'INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, first_name, last_name]
        );

        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Login user
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const pool = await getPool();
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
    try {
        const pool = await getPool();
        const { id } = req.params;
        const [users] = await pool.query('SELECT id, email, first_name, last_name, phone, address, city, zip_code FROM users WHERE id = ?', [id]);

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
    try {
        const pool = await getPool();
        const { id } = req.params;
        const { first_name, last_name, phone, address, city, zip_code } = req.body;

        await pool.query(
            'UPDATE users SET first_name = ?, last_name = ?, phone = ?, address = ?, city = ?, zip_code = ? WHERE id = ?',
            [first_name, last_name, phone, address, city, zip_code, id]
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
