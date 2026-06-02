const { getPool } = require('../config/db');

// Get All FAQs
exports.getAllFAQs = async (req, res) => {
    try {
        const pool = await getPool();

        const [faqs] = await pool.query(
            'SELECT * FROM faqs WHERE is_active = TRUE ORDER BY category, id'
        );

        res.json(faqs);
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        res.status(500).json({ message: 'Failed to fetch FAQs' });
    }
};

// Get FAQs by Category
exports.getFAQsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const pool = await getPool();

        const [faqs] = await pool.query(
            'SELECT * FROM faqs WHERE category = ? AND is_active = TRUE ORDER BY id',
            [category]
        );

        res.json(faqs);
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        res.status(500).json({ message: 'Failed to fetch FAQs' });
    }
};

// Get Single FAQ
exports.getFAQ = async (req, res) => {
    try {
        const { faqId } = req.params;
        const pool = await getPool();

        const [[faq]] = await pool.query(
            'SELECT * FROM faqs WHERE id = ? AND is_active = TRUE',
            [faqId]
        );

        if (!faq) {
            return res.status(404).json({ message: 'FAQ not found' });
        }

        res.json(faq);
    } catch (error) {
        console.error('Error fetching FAQ:', error);
        res.status(500).json({ message: 'Failed to fetch FAQ' });
    }
};

// Create FAQ (Admin)
exports.createFAQ = async (req, res) => {
    try {
        const { question, answer, category } = req.body;

        if (!question || !answer || !category) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const pool = await getPool();

        const [result] = await pool.query(
            `INSERT INTO faqs (question, answer, category, is_active) 
       VALUES (?, ?, ?, TRUE)`,
            [question, answer, category]
        );

        res.status(201).json({
            message: 'FAQ created successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error creating FAQ:', error);
        res.status(500).json({ message: 'Failed to create FAQ' });
    }
};

// Update FAQ (Admin)
exports.updateFAQ = async (req, res) => {
    try {
        const { faqId } = req.params;
        const { question, answer, category, is_active } = req.body;

        const pool = await getPool();

        await pool.query(
            `UPDATE faqs SET question = ?, answer = ?, category = ?, is_active = ? WHERE id = ?`,
            [question, answer, category, is_active, faqId]
        );

        res.json({ message: 'FAQ updated successfully' });
    } catch (error) {
        console.error('Error updating FAQ:', error);
        res.status(500).json({ message: 'Failed to update FAQ' });
    }
};

// Delete FAQ (Admin)
exports.deleteFAQ = async (req, res) => {
    try {
        const { faqId } = req.params;
        const pool = await getPool();

        await pool.query('DELETE FROM faqs WHERE id = ?', [faqId]);

        res.json({ message: 'FAQ deleted successfully' });
    } catch (error) {
        console.error('Error deleting FAQ:', error);
        res.status(500).json({ message: 'Failed to delete FAQ' });
    }
};
