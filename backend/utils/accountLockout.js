const { getPool } = require('../config/db');

/**
 * Check if an account is locked
 * @param {number} userId - User ID
 * @returns {Promise<boolean>} - true if account is locked
 */
const isAccountLocked = async (userId) => {
    try {
        const pool = await getPool();
        const [rows] = await pool.query(
            'SELECT locked_until FROM users WHERE id = ?',
            [userId]
        );

        if (rows.length === 0) return false;

        const lockedUntil = rows[0].locked_until;
        if (!lockedUntil) return false;

        const now = new Date();
        if (new Date(lockedUntil) > now) {
            return true; // Account is still locked
        } else {
            // Lock period has expired, reset
            await pool.query(
                'UPDATE users SET locked_until = NULL, failed_login_attempts = 0 WHERE id = ?',
                [userId]
            );
            return false;
        }
    } catch (error) {
        console.error('Error checking account lock status:', error);
        return false;
    }
};

/**
 * Get remaining lockout time in minutes
 * @param {number} userId - User ID
 * @returns {Promise<number|null>} - Remaining minutes or null if not locked
 */
const getLockedUntil = async (userId) => {
    try {
        const pool = await getPool();
        const [rows] = await pool.query(
            'SELECT locked_until FROM users WHERE id = ?',
            [userId]
        );

        if (rows.length === 0 || !rows[0].locked_until) return null;

        const now = new Date();
        const lockedUntil = new Date(rows[0].locked_until);

        if (lockedUntil > now) {
            const minutesRemaining = Math.ceil((lockedUntil - now) / (1000 * 60));
            return minutesRemaining;
        }
        return null;
    } catch (error) {
        console.error('Error getting lockout time:', error);
        return null;
    }
};

/**
 * Record a failed login attempt
 * @param {number} userId - User ID
 * @param {number} maxAttempts - Maximum allowed attempts (default: 5)
 * @param {number} lockoutMinutes - Duration of lockout in minutes (default: 30)
 * @returns {Promise<{attempts: number, isLocked: boolean}>}
 */
const recordFailedLogin = async (userId, maxAttempts = 5, lockoutMinutes = 30) => {
    try {
        const pool = await getPool();

        // Increment failed login attempts
        await pool.query(
            'UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = ?',
            [userId]
        );

        // Get current attempt count
        const [rows] = await pool.query(
            'SELECT failed_login_attempts FROM users WHERE id = ?',
            [userId]
        );

        if (rows.length === 0) {
            throw new Error('User not found');
        }

        const attempts = rows[0].failed_login_attempts;
        let isLocked = false;

        // Lock account if max attempts exceeded
        if (attempts >= maxAttempts) {
            const lockUntil = new Date(Date.now() + lockoutMinutes * 60 * 1000);
            await pool.query(
                'UPDATE users SET locked_until = ? WHERE id = ?',
                [lockUntil, userId]
            );
            isLocked = true;

            if (process.env.NODE_ENV === 'development') {
                console.log(`Account locked for user ${userId} until ${lockUntil}`);
            }
        }

        return { attempts, isLocked };
    } catch (error) {
        console.error('Error recording failed login:', error);
        throw error;
    }
};

/**
 * Reset failed login attempts for a user
 * @param {number} userId - User ID
 */
const resetFailedLogins = async (userId) => {
    try {
        const pool = await getPool();
        await pool.query(
            'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?',
            [userId]
        );
    } catch (error) {
        console.error('Error resetting failed logins:', error);
        throw error;
    }
};

/**
 * Unlock an account manually (admin function)
 * @param {number} userId - User ID
 */
const unlockAccount = async (userId) => {
    try {
        const pool = await getPool();
        await pool.query(
            'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?',
            [userId]
        );
    } catch (error) {
        console.error('Error unlocking account:', error);
        throw error;
    }
};

module.exports = {
    isAccountLocked,
    getLockedUntil,
    recordFailedLogin,
    resetFailedLogins,
    unlockAccount
};
