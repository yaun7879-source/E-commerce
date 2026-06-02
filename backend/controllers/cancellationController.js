const { getPool } = require('../config/db');

// Create Cancellation Request
exports.createCancellation = async (req, res) => {
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

        // Check if order can be cancelled (not delivered/cancelled already)
        if (order.order_status === 'delivered' || order.order_status === 'cancelled') {
            return res.status(400).json({ message: 'This order cannot be cancelled' });
        }

        // Check if cancellation was requested within 24 hours
        const orderTime = new Date(order.created_at);
        const currentTime = new Date();
        const hoursElapsed = (currentTime - orderTime) / (1000 * 60 * 60);

        if (hoursElapsed > 24) {
            return res.status(400).json({ message: 'Cancellation period (24 hours) has expired' });
        }

        // Create cancellation request
        await pool.query(
            `INSERT INTO cancellations (order_id, user_id, reason, description, cancellation_status) 
       VALUES (?, ?, ?, ?, 'pending')`,
            [order_id, user_id, reason, description]
        );

        res.status(201).json({ message: 'Cancellation request submitted successfully' });
    } catch (error) {
        console.error('Error creating cancellation:', error);
        res.status(500).json({ message: 'Failed to create cancellation request' });
    }
};

// Get Cancellations for User
exports.getUserCancellations = async (req, res) => {
    try {
        const user_id = req.user.id;
        const pool = await getPool();

        const [cancellations] = await pool.query(
            `SELECT c.*, o.total_amount, o.order_date
       FROM cancellations c
       JOIN orders o ON c.order_id = o.id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
            [user_id]
        );

        res.json(cancellations);
    } catch (error) {
        console.error('Error fetching cancellations:', error);
        res.status(500).json({ message: 'Failed to fetch cancellations' });
    }
};

// Get Cancellation by ID
exports.getCancellation = async (req, res) => {
    try {
        const { cancellationId } = req.params;
        const user_id = req.user.id;
        const pool = await getPool();

        const [[cancellation]] = await pool.query(
            `SELECT c.*, o.total_amount, o.order_date
       FROM cancellations c
       JOIN orders o ON c.order_id = o.id
       WHERE c.id = ? AND c.user_id = ?`,
            [cancellationId, user_id]
        );

        if (!cancellation) {
            return res.status(404).json({ message: 'Cancellation request not found' });
        }

        res.json(cancellation);
    } catch (error) {
        console.error('Error fetching cancellation:', error);
        res.status(500).json({ message: 'Failed to fetch cancellation' });
    }
};

// Update Cancellation Status (Admin)
exports.updateCancellationStatus = async (req, res) => {
    try {
        const { cancellationId } = req.params;
        const { cancellation_status, refund_amount } = req.body;

        if (!cancellation_status) {
            return res.status(400).json({ message: 'Cancellation status is required' });
        }

        const pool = await getPool();

        await pool.query(
            `UPDATE cancellations SET cancellation_status = ?, refund_amount = ? WHERE id = ?`,
            [cancellation_status, refund_amount, cancellationId]
        );

        res.json({ message: 'Cancellation status updated successfully' });
    } catch (error) {
        console.error('Error updating cancellation:', error);
        res.status(500).json({ message: 'Failed to update cancellation' });
    }
};
