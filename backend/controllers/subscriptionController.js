const { getPool } = require('../config/db');

exports.checkSubscription = async (req, res) => {
    try {
        const pool = await getPool();
        const userId = req.user.id;

        const [subscription] = await pool.query(
            'SELECT id, user_id, discount_percentage, is_active, discount_used_on_first_order FROM subscriptions WHERE user_id = ? AND is_active = TRUE',
            [userId]
        );

        if (subscription.length > 0) {
            // Discount only applies if not used on first order yet
            const canApplyDiscount = !subscription[0].discount_used_on_first_order;
            return res.json({
                isSubscribed: true,
                discountPercentage: canApplyDiscount ? subscription[0].discount_percentage : 0,
                discountUsedOnFirstOrder: subscription[0].discount_used_on_first_order
            });
        }

        res.json({ isSubscribed: false, discountPercentage: 0, discountUsedOnFirstOrder: false });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.subscribe = async (req, res) => {
    try {
        const pool = await getPool();
        const userId = req.user.id;
        const email = req.user.email;

        // Check if already subscribed
        const [existing] = await pool.query(
            'SELECT id FROM subscriptions WHERE user_id = ?',
            [userId]
        );

        if (existing.length > 0) {
            // Update existing subscription
            await pool.query(
                'UPDATE subscriptions SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
                [userId]
            );
            return res.json({ message: 'Already subscribed. Subscription reactivated.', isSubscribed: true, discountPercentage: 10 });
        }

        // Create new subscription
        await pool.query(
            'INSERT INTO subscriptions (user_id, email, discount_percentage, is_active) VALUES (?, ?, ?, ?)',
            [userId, email, 10, true]
        );

        res.status(201).json({ message: 'Successfully subscribed for 10% discount!', isSubscribed: true, discountPercentage: 10 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.unsubscribe = async (req, res) => {
    try {
        const pool = await getPool();
        const userId = req.user.id;

        await pool.query(
            'UPDATE subscriptions SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
            [userId]
        );

        res.json({ message: 'Unsubscribed successfully.', isSubscribed: false });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mark discount as used on first order
exports.markDiscountAsUsed = async (userId) => {
    try {
        const pool = await getPool();
        await pool.query(
            'UPDATE subscriptions SET discount_used_on_first_order = TRUE, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
            [userId]
        );
        return true;
    } catch (error) {
        console.error('Error marking discount as used:', error);
        return false;
    }
};
