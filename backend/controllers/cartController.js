const { getPool } = require('../config/db');

// Get user cart
exports.getCart = async (req, res) => {
    try {
        const pool = await getPool();
        const userId = req.userId;
        const [cartItems] = await pool.query(
            `SELECT c.id, c.product_id, c.quantity, p.name, p.price, p.image_url 
       FROM cart c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = ?`,
            [userId]
        );
        res.json(cartItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add to cart
exports.addToCart = async (req, res) => {
    try {
        const pool = await getPool();
        const userId = req.userId;
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        // Check if item already in cart
        const [existing] = await pool.query(
            'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        if (existing.length > 0) {
            // Update quantity
            await pool.query(
                'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
                [quantity, userId, productId]
            );
        } else {
            // Insert new item
            await pool.query(
                'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [userId, productId, quantity]
            );
        }

        res.json({ message: 'Item added to cart' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
    try {
        const pool = await getPool();
        const userId = req.userId;
        const { cartItemId, quantity } = req.body;

        if (!cartItemId || quantity == null) {
            return res.status(400).json({ error: 'cartItemId and quantity are required' });
        }

        if (quantity <= 0) {
            await pool.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [cartItemId, userId]);
            return res.json({ message: 'Item removed from cart' });
        }

        await pool.query(
            'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
            [quantity, cartItemId, userId]
        );

        res.json({ message: 'Cart item updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Remove from cart
exports.removeFromCart = async (req, res) => {
    try {
        const pool = await getPool();
        const userId = req.userId;
        const { cartItemId } = req.params;
        await pool.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [cartItemId, userId]);
        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Clear cart
exports.clearCart = async (req, res) => {
    try {
        const pool = await getPool();
        const userId = req.userId;
        await pool.query('DELETE FROM cart WHERE user_id = ?', [userId]);
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
