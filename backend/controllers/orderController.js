const { getPool } = require('../config/db');

// Create order
exports.createOrder = async (req, res) => {
    try {
        const pool = await getPool();
        const {
            userId,
            items,
            total_amount,
            shipping_address,
            payment_method,
            payment_status = 'pending',
            order_status = 'pending',
            razorpay_order_id = null,
            razorpay_payment_id = null,
        } = req.body;

        // Create order
        const [orderResult] = await pool.query(
            `INSERT INTO orders 
             (user_id, total_amount, shipping_address, payment_method, payment_status, order_status, razorpay_order_id, razorpay_payment_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                total_amount,
                shipping_address,
                payment_method,
                payment_status,
                order_status,
                razorpay_order_id,
                razorpay_payment_id,
            ]
        );

        const orderId = orderResult.insertId;

        // Add order items
        for (const item of items) {
            await pool.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price]
            );
        }

        // Clear cart
        await pool.query('DELETE FROM cart WHERE user_id = ?', [userId]);

        res.status(201).json({ orderId, message: 'Order created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
    try {
        const pool = await getPool();
        const { userId } = req.params;
        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get order details
exports.getOrderDetails = async (req, res) => {
    try {
        const pool = await getPool();
        const { orderId } = req.params;
        const [order] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);

        if (order.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const [items] = await pool.query(
            `SELECT oi.*, p.name 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
            [orderId]
        );

        res.json({ order: order[0], items });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const pool = await getPool();
        const { orderId } = req.params;
        const { status, order_status } = req.body;

        if (order_status) {
            await pool.query('UPDATE orders SET order_status = ? WHERE id = ?', [order_status, orderId]);
        }

        if (status) {
            await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
        }

        res.json({ message: 'Order status updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
