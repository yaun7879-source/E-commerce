const { getPool } = require('../config/db');

exports.getReviewsByProductId = async (req, res) => {
    try {
        const pool = await getPool();
        const { productId } = req.params;
        const [reviews] = await pool.query(
            'SELECT id, product_id, name, rating, comment, created_at FROM reviews WHERE product_id = ? ORDER BY created_at DESC',
            [productId]
        );
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createReview = async (req, res) => {
    try {
        const pool = await getPool();
        const { productId } = req.params;
        const { name, rating, comment } = req.body;

        if (!name || !comment) {
            return res.status(400).json({ error: 'Name and comment are required.' });
        }

        const parsedRating = Number(rating) || 5;

        const [result] = await pool.query(
            'INSERT INTO reviews (product_id, name, rating, comment) VALUES (?, ?, ?, ?)',
            [productId, name, parsedRating, comment]
        );

        const [newReviewRows] = await pool.query(
            'SELECT id, product_id, name, rating, comment, created_at FROM reviews WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json(newReviewRows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllReviews = async (req, res) => {
    try {
        const pool = await getPool();
        const [reviews] = await pool.query(
            `SELECT r.id,
                    r.product_id,
                    p.name AS product_name,
                    p.image_url AS product_image,
                    r.name AS reviewer,
                    r.rating,
                    r.comment,
                    r.created_at
             FROM reviews r
             LEFT JOIN products p ON p.id = r.product_id
             ORDER BY r.created_at DESC`
        );
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getReviewSummary = async (req, res) => {
    try {
        const pool = await getPool();
        const [summary] = await pool.query(
            `SELECT p.id AS product_id,
                    p.name,
                    p.image_url,
                    COALESCE(COUNT(r.id), 0) AS review_count,
                    COALESCE(ROUND(AVG(r.rating), 1), 0) + 0 AS avg_rating
             FROM products p
             LEFT JOIN reviews r ON p.id = r.product_id
             GROUP BY p.id
             ORDER BY review_count DESC, p.name ASC`
        );
        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
