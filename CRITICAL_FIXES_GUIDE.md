# CRITICAL FIXES - Implementation Guide

This document contains ready-to-apply fixes for the most critical issues found in the deployment audit.

## 1️⃣ FIX: Remove Console.logs (15 min)

### backend/server.js - Lines 13-15
Replace these debug logs:
```javascript
// ❌ REMOVE THESE
console.log('Loaded env from:', path.resolve(__dirname, '.env'));
console.log('GOOGLE_CLIENT_ID=', process.env.GOOGLE_CLIENT_ID ? 'loaded' : 'missing');
console.log('GOOGLE_CLIENT_SECRET=', process.env.GOOGLE_CLIENT_SECRET ? 'loaded' : 'missing');

// ✅ REPLACE WITH (development only)
if (process.env.NODE_ENV === 'development') {
    const { logger } = require('./middleware/logger');
    logger.debug('Environment loaded successfully');
    logger.debug('OAuth credentials:', {
        googleId: process.env.GOOGLE_CLIENT_ID ? 'loaded' : 'missing',
        googleSecret: process.env.GOOGLE_CLIENT_SECRET ? 'loaded' : 'missing'
    });
}
```

### backend/config/db.js - Line 60
Replace:
```javascript
console.log('✅ MySQL Database connected successfully!');

// ✅ REPLACE WITH
const { logger } = require('../middleware/logger');
if (process.env.NODE_ENV === 'development') {
    logger.info('Database connection established');
}
```

### backend/config/schema.js - Multiple instances
Replace all `console.log` with:
```javascript
const { logger } = require('../middleware/logger');

// ✅ PATTERN
if (process.env.NODE_ENV === 'development') {
    logger.info('✅ Table created/exists');
} else {
    logger.error('❌ Error creating table:', error);
}
```

---

## 2️⃣ FIX: Secure Session Secret (5 min)

### backend/server.js - Lines 69-76
Replace:
```javascript
// ❌ INSECURE - Has default hardcoded value
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-key',
    // ...
}));

// ✅ SECURE - Requires env variable
if (!process.env.SESSION_SECRET) {
    console.error('ERROR: SESSION_SECRET environment variable must be set in production');
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);  // Exit if production and not set
    }
}

if (!process.env.JWT_SECRET) {
    console.error('ERROR: JWT_SECRET environment variable must be set in production');
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
}

app.use(session({
    secret: process.env.SESSION_SECRET,  // No default fallback
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}));
```

---

## 3️⃣ FIX: Add Account Lockout Mechanism (30 min)

### Step 1: Update Database Schema

Create file: `backend/migrations/001_add_account_lockout.sql`
```sql
-- Add account lockout columns to users table
ALTER TABLE users ADD COLUMN (
    login_attempts INT DEFAULT 0 COMMENT 'Failed login attempts',
    locked_until DATETIME NULL COMMENT 'When account lockout expires'
);

-- Reset lockout on successful login
ALTER TABLE users ADD COLUMN (
    last_login DATETIME NULL,
    last_login_ip VARCHAR(45) NULL
);

-- Create index for faster lockout checks
CREATE INDEX idx_users_locked_until ON users(locked_until);
```

Run:
```bash
mysql -u root -p mahasu_ecommerce < backend/migrations/001_add_account_lockout.sql
```

### Step 2: Update Schema Initialization

In `backend/config/schema.js`, add:
```javascript
const createAccountLockoutColumns = async () => {
    const pool = await getPool();
    const addColumnsQuery = `
        ALTER TABLE users ADD COLUMN IF NOT EXISTS login_attempts INT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS locked_until DATETIME NULL,
        ADD COLUMN IF NOT EXISTS last_login DATETIME NULL,
        ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(45) NULL
    `;
    
    try {
        await pool.query(addColumnsQuery);
        console.log('✅ Account lockout columns added/verified');
    } catch (error) {
        if (!error.message.includes('Duplicate')) {
            console.error('⚠️ Could not add lockout columns:', error.message);
        }
    }
};

// Call in initializeDatabase()
exports.initializeDatabase = async () => {
    // ... existing code ...
    await createAccountLockoutColumns();
    // ... rest of initialization ...
};
```

### Step 3: Add Lockout Utilities

Create file: `backend/utils/accountLockout.js`
```javascript
const { getPool } = require('../config/db');

const LOCKOUT_THRESHOLD = 5;  // Lock after 5 failed attempts
const LOCKOUT_DURATION = 30 * 60 * 1000;  // 30 minutes in milliseconds

/**
 * Check if user account is locked
 */
exports.isAccountLocked = async (userId) => {
    try {
        const pool = await getPool();
        const [[user]] = await pool.query(
            'SELECT locked_until FROM users WHERE id = ?',
            [userId]
        );
        
        if (!user) return false;
        
        if (user.locked_until) {
            const lockoutExpiry = new Date(user.locked_until);
            if (lockoutExpiry > new Date()) {
                return true;  // Still locked
            } else {
                // Lockout expired, reset
                await pool.query(
                    'UPDATE users SET login_attempts = 0, locked_until = NULL WHERE id = ?',
                    [userId]
                );
                return false;
            }
        }
        
        return false;
    } catch (error) {
        console.error('Error checking account lock:', error);
        return false;
    }
};

/**
 * Increment failed login attempts
 */
exports.incrementFailedAttempts = async (userId) => {
    try {
        const pool = await getPool();
        
        await pool.query(
            'UPDATE users SET login_attempts = login_attempts + 1 WHERE id = ?',
            [userId]
        );
        
        const [[user]] = await pool.query(
            'SELECT login_attempts FROM users WHERE id = ?',
            [userId]
        );
        
        // Lock account if threshold exceeded
        if (user.login_attempts >= LOCKOUT_THRESHOLD) {
            const lockUntil = new Date(Date.now() + LOCKOUT_DURATION);
            await pool.query(
                'UPDATE users SET locked_until = ? WHERE id = ?',
                [lockUntil, userId]
            );
            return { locked: true, attempts: user.login_attempts };
        }
        
        return { locked: false, attempts: user.login_attempts };
    } catch (error) {
        console.error('Error incrementing failed attempts:', error);
        throw error;
    }
};

/**
 * Reset failed login attempts on successful login
 */
exports.resetFailedAttempts = async (userId) => {
    try {
        const pool = await getPool();
        const clientIp = getClientIp();  // You'll need to pass this
        
        await pool.query(
            'UPDATE users SET login_attempts = 0, locked_until = NULL, last_login = NOW(), last_login_ip = ? WHERE id = ?',
            [clientIp, userId]
        );
    } catch (error) {
        console.error('Error resetting failed attempts:', error);
    }
};

/**
 * Get IP address from request
 */
const getClientIp = (req) => {
    return (req.headers['x-forwarded-for'] || '').split(',')[0] ||
           req.socket.remoteAddress ||
           req.connection.remoteAddress ||
           'unknown';
};

exports.getClientIp = getClientIp;
```

### Step 4: Update Authentication Controller

In `backend/controllers/userController.js`, update login handler:
```javascript
const { 
    isAccountLocked, 
    incrementFailedAttempts, 
    resetFailedAttempts,
    getClientIp 
} = require('../utils/accountLockout');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        // Find user
        const pool = await getPool();
        const [[user]] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Check if account is locked
        const locked = await isAccountLocked(user.id);
        if (locked) {
            return res.status(429).json({ 
                error: 'Account locked due to too many failed login attempts. Please try again in 30 minutes.'
            });
        }
        
        // Verify password
        const bcrypt = require('bcryptjs');
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            // Increment failed attempts
            const { locked: nowLocked } = await incrementFailedAttempts(user.id);
            if (nowLocked) {
                return res.status(429).json({ 
                    error: 'Account locked due to too many failed login attempts.'
                });
            }
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Success - reset attempts and generate token
        await resetFailedAttempts(user.id);
        
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({ 
            token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
```

---

## 4️⃣ FIX: Add Database Indexes (10 min)

### Create file: `backend/migrations/002_add_indexes.sql`

```sql
-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_tag ON products(tag);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Users table indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Cart table indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_unique_user_product ON cart(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Order items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- Addresses
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
```

Run:
```bash
mysql -u root -p mahasu_ecommerce < backend/migrations/002_add_indexes.sql
```

---

## 5️⃣ FIX: Create .env.example (5 min)

Create file: `backend/.env.example`
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=mahasu_user
DB_PASSWORD=change_me_to_strong_password
DB_NAME=mahasu_ecommerce

# Server Configuration
NODE_ENV=production
PORT=5001

# Security - Generate strong random values!
JWT_SECRET=change_me_to_random_32_character_string_min_length
SESSION_SECRET=change_me_to_random_32_character_string_min_length

# OAuth - Google
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback

# Payment Gateway - Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

# Email Service
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Logging
LOG_LEVEL=info
```

Create file: `my-app/.env.example`
```bash
# API Configuration
VITE_API_URL=https://api.yourdomain.com

# Optional: Analytics
VITE_GOOGLE_ANALYTICS_ID=your_ga_id_here

# Optional: Error Tracking
VITE_SENTRY_DSN=your_sentry_dsn_here
```

---

## 6️⃣ FIX: Add Health Check Endpoint (5 min)

In `backend/server.js`, add before route registration:
```javascript
// Add this after middleware setup, before routes
app.get('/api/health', async (req, res) => {
    try {
        const pool = await getPool();
        
        // Check database connection with timeout
        const connection = await Promise.race([
            pool.getConnection(),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Database timeout')), 5000)
            )
        ]);
        
        await connection.query('SELECT 1');
        connection.release();
        
        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV,
            database: 'connected',
            version: require('../package.json').version
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: error.message,
            database: 'disconnected',
            timestamp: new Date().toISOString()
        });
    }
});
```

Test:
```bash
curl http://localhost:5001/api/health
```

---

## 7️⃣ FIX: Improve Rate Limiting (10 min)

Replace in `backend/middleware/security.js`:
```javascript
// ✅ IMPROVED RATE LIMITING
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100,                   // 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip || req.socket.remoteAddress,
    message: { error: 'Too many requests, please try again later.' }
});

// Strict limiter for authentication
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 5,                     // 5 attempts per window
    skipSuccessfulRequests: true,  // Don't count successful logins
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip || req.socket.remoteAddress,
    message: { error: 'Too many login attempts. Please try again in 15 minutes.' }
});

// Strict limiter for password reset
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,  // 1 hour
    max: 3,                     // 3 requests per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many password reset attempts. Please try again later.' }
});

const createSecurity = (app) => {
    app.use(helmet());
    app.use(xss());
    app.use(cookieParser());
    
    // Apply specific limiters to routes (later in server.js)
    app._globalLimiter = globalLimiter;
    app._authLimiter = authLimiter;
    app._passwordResetLimiter = passwordResetLimiter;
};
```

In `backend/server.js`, apply the limiters:
```javascript
// Apply rate limiters
app.use(app._globalLimiter);  // Global limiter
app.use('/api/auth/', app._authLimiter);
app.use('/api/users/login', app._authLimiter);
app.use('/api/users/register', app._authLimiter);
app.use('/api/users/forgot-password', app._passwordResetLimiter);
```

---

## ✅ VERIFICATION CHECKLIST

After applying these fixes, verify:

```bash
# 1. No console.logs in production
grep -r "console\.log" backend/
# Should return nothing or only development-guarded logs

# 2. Verify environment variables
echo "SESSION_SECRET=$SESSION_SECRET"
echo "JWT_SECRET=$JWT_SECRET"
# Both should be set and not show defaults

# 3. Health check
curl http://localhost:5001/api/health
# Should return 200 with healthy status

# 4. Database connected
docker exec mahasu_db mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SHOW TABLES LIKE 'users';"
# Should list users table

# 5. Login with lockout
# Try 6 failed login attempts - 6th should fail with lockout message

# 6. Check indexes
mysql -u root -p mahasu_ecommerce -e "SHOW INDEXES FROM users;"
# Should show email index
```

---

**Total Implementation Time:** ~1-1.5 hours  
**Difficulty:** Medium  
**Impact:** HIGH - Fixes most critical security and performance issues
