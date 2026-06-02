const { getPool } = require('../config/db');

// Create Return
exports.createReturn = async (req, res) => {
    try {
        const { order_id, reason, description } = req.body;
        const user_id = req.user.id;

        if (!order_id || !reason || !description) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const pool = await getPool();

        // Verify order belongs to user
        const [[order]] = await pool.query(
            'SELECT * FROM orders WHERE id = ? AND user_id = ?',
            [order_id, user_id]
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Create return request
        await pool.query(
            `INSERT INTO returns (order_id, user_id, reason, description, return_status) 
       VALUES (?, ?, ?, ?, 'requested')`,
            [order_id, user_id, reason, description]
        );

        res.status(201).json({ message: 'Return request submitted successfully' });
    } catch (error) {
        console.error('Error creating return:', error);
        res.status(500).json({ message: 'Failed to create return' });
    }
};

// Get Returns for User
exports.getUserReturns = async (req, res) => {
    try {
        const user_id = req.user.id;
        const pool = await getPool();

        const [returns] = await pool.query(
            `SELECT r.*, o.total_amount, o.order_date
       FROM returns r
       JOIN orders o ON r.order_id = o.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
            [user_id]
        );

        res.json(returns);
    } catch (error) {
        console.error('Error fetching returns:', error);
        res.status(500).json({ message: 'Failed to fetch returns' });
    }
};

// Get Return by ID
exports.getReturn = async (req, res) => {
    try {
        const { returnId } = req.params;
        const user_id = req.user.id;
        const pool = await getPool();

        const [[returnData]] = await pool.query(
            `SELECT r.*, o.total_amount, o.order_date
       FROM returns r
       JOIN orders o ON r.order_id = o.id
       WHERE r.id = ? AND r.user_id = ?`,
            [returnId, user_id]
        );

        if (!returnData) {
            return res.status(404).json({ message: 'Return not found' });
        }

        res.json(returnData);
    } catch (error) {
        console.error('Error fetching return:', error);
        res.status(500).json({ message: 'Failed to fetch return' });
    }
};

// Update Return Status (Admin)
exports.updateReturnStatus = async (req, res) => {
    try {
        const { returnId } = req.params;
        const { return_status, refund_amount } = req.body;

        if (!return_status) {
            return res.status(400).json({ message: 'Return status is required' });
        }

        const pool = await getPool();

        await pool.query(
            `UPDATE returns SET return_status = ?, refund_amount = ? WHERE id = ?`,
            [return_status, refund_amount, returnId]
        );

        res.json({ message: 'Return status updated successfully' });
    } catch (error) {
        console.error('Error updating return:', error);
        res.status(500).json({ message: 'Failed to update return' });
    }
};
