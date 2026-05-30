const { getPool } = require('../config/db');

// Get user cart
exports.getCart = async (req, res) => {
    try {
        const pool = await getPool();
        const userId = req.user.id;
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
        const userId = req.user.id;
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        // Validate quantity: must be between 1 and 100
        const qty = parseInt(quantity, 10);
        if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
            return res.status(400).json({ error: 'Quantity must be between 1 and 100' });
        }

        // Verify product exists
        const [product] = await pool.query('SELECT id, price FROM products WHERE id = ?', [productId]);
        if (product.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Check if item already in cart
        const [existing] = await pool.query(
            'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        if (existing.length > 0) {
            // Update quantity - check max doesn't exceed 100
            const newQuantity = existing[0].quantity + qty;
            if (newQuantity > 100) {
                return res.status(400).json({ error: 'Maximum quantity per item is 100' });
            }
            await pool.query(
                'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
                [qty, userId, productId]
            );
        } else {
            // Insert new item
            await pool.query(
                'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [userId, productId, qty]
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
        const userId = req.user.id;
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
        const userId = req.user.id;
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
        const userId = req.user.id;
        await pool.query('DELETE FROM cart WHERE user_id = ?', [userId]);
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
