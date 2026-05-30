const { getPool } = require('../config/db');

// Create order
exports.createOrder = async (req, res) => {
    try {
        const pool = await getPool();
        const { items, shipping_address, payment_method } = req.body;

        // Require authenticated user (req.user should be set by auth middleware)
        if (!req.user || !req.user.id) return res.status(401).json({ error: 'Authentication required' });
        const userId = req.user.id;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Order must contain at least one item' });
        }

        // Validate items and compute total server-side to prevent tampering
        let computedTotal = 0;
        const validatedItems = [];

        for (const it of items) {
            const productId = Number(it.product_id);
            const quantity = Number(it.quantity);
            if (!productId || quantity <= 0) {
                return res.status(400).json({ error: 'Invalid product or quantity in items' });
            }

            const [rows] = await pool.query('SELECT id, price FROM products WHERE id = ?', [productId]);
            if (rows.length === 0) return res.status(400).json({ error: `Product ${productId} not found` });

            const price = Number(rows[0].price);
            const lineTotal = price * quantity;
            computedTotal += lineTotal;
            validatedItems.push({ product_id: productId, quantity, price });
        }

        // Insert order with server-calculated total
        const [orderResult] = await pool.query(
            `INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, payment_status, order_status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, computedTotal, shipping_address || '', payment_method || '', 'pending', 'pending']
        );

        const orderId = orderResult.insertId;

        // Add order items to DB
        for (const item of validatedItems) {
            await pool.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price]
            );
        }

        // Clear cart server-side for this user
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

        // Only allow requesting user's own orders (or admin - admin not implemented yet)
        if (!req.user || String(req.user.id) !== String(userId)) {
            return res.status(403).json({ error: 'Forbidden' });
        }

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

        // Ensure the requesting user owns the order (or is admin)
        if (!req.user || String(req.user.id) !== String(order[0].user_id)) {
            return res.status(403).json({ error: 'Forbidden' });
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
