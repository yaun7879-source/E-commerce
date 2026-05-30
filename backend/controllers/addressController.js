// addressController.js
// addressController.js — add this as the FIRST line
const { getPool } = require('../config/db');
exports.getAddresses = async (req, res) => {
    const pool = await getPool();
    const [addresses] = await pool.query(
        'SELECT id, label, full_name, street, city, state, zip, country, phone, created_at, updated_at FROM addresses WHERE user_id = ? ORDER BY updated_at DESC',
        [req.user.id]  // ✅ changed
    );
    res.json(addresses);
};

exports.getAddress = async (req, res) => {
    const { id } = req.params;
    const pool = await getPool();
    const [addresses] = await pool.query(
        'SELECT id, label, full_name, street, city, state, zip, country, phone, created_at, updated_at FROM addresses WHERE id = ? AND user_id = ?',
        [id, req.user.id]  // ✅ changed
    );
    if (!addresses.length) return res.status(404).json({ error: 'Address not found' });
    res.json(addresses[0]);
};

exports.createAddress = async (req, res) => {
    const { label = '', full_name, street, city, state, zip, country = 'India', phone } = req.body;

    if (!full_name || !street || !city || !state || !zip || !phone) {
        return res.status(400).json({ error: 'All address fields are required' });
    }

    const pool = await getPool();
    const [result] = await pool.query(
        'INSERT INTO addresses (user_id, label, full_name, street, city, state, zip, country, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [req.user.id, label, full_name, street, city, state, zip, country, phone]  // ✅ changed
    );

    res.status(201).json({
        id: result.insertId,
        user_id: req.user.id,  // ✅ changed
        label, full_name, street, city, state, zip, country, phone,
    });
};

exports.updateAddress = async (req, res) => {
    const { id } = req.params;
    const { label = '', full_name, street, city, state, zip, country = 'India', phone } = req.body;

    if (!full_name || !street || !city || !state || !zip || !phone) {
        return res.status(400).json({ error: 'All address fields are required' });
    }

    const pool = await getPool();
    const [result] = await pool.query(
        'UPDATE addresses SET label = ?, full_name = ?, street = ?, city = ?, state = ?, zip = ?, country = ?, phone = ? WHERE id = ? AND user_id = ?',
        [label, full_name, street, city, state, zip, country, phone, id, req.user.id]  // ✅ changed
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Address not found' });
    res.json({ message: 'Address updated successfully' });
};

exports.deleteAddress = async (req, res) => {
    const { id } = req.params;
    const pool = await getPool();
    const [result] = await pool.query(
        'DELETE FROM addresses WHERE id = ? AND user_id = ?',
        [id, req.user.id]  // ✅ changed
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Address not found' });
    res.json({ message: 'Address deleted successfully' });
};