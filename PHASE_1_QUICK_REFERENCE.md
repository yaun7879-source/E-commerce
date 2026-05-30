# Quick Reference: Phase 1 Implementation Checklist

## 🎯 Phase 1: Critical Fixes (2-3 days)
**Status:** Ready to implement immediately  
**Impact:** Highest priority - required before any production deployment  

---

## Task 1.1: Remove Console.logs (2 hours)

### Files to Check
```bash
# Search for all console statements
grep -r "console\." backend/

# Expected: 13+ matches in:
# - server.js (6 matches)
# - config/schema.js (15+ matches)
# - config/db.js (1 match)
```

### Key Changes

**backend/server.js - Lines 13-15**
```javascript
// ❌ REMOVE
console.log('Loaded env from:', path.resolve(__dirname, '.env'));
console.log('GOOGLE_CLIENT_ID=', process.env.GOOGLE_CLIENT_ID ? 'loaded' : 'missing');
console.log('GOOGLE_CLIENT_SECRET=', process.env.GOOGLE_CLIENT_SECRET ? 'loaded' : 'missing');
```

**backend/server.js - Lines 93-96**
```javascript
// ❌ REMOVE or wrap in development check
console.log('✅ Database initialized successfully');
console.error('⚠️  Database initialization error:', error.message);
console.log('⚠️  Server will continue...');
```

**backend/server.js - Lines 133-134, 139, 142**
```javascript
// ❌ REMOVE
console.log(`\n🚀 Server running on http://localhost:${PORT}`);
console.log(`📧 API Health Check: http://localhost:${PORT}/api/health\n`);
console.error(`\n❌ Port ${PORT} is already in use...`);
```

**backend/config/db.js - Line 60**
```javascript
// ❌ REMOVE
console.log('✅ MySQL Database connected successfully!');
```

**backend/config/schema.js - All console.log statements**
```javascript
// ❌ REMOVE ~15+ instances of:
console.log('✅ ...');
console.error('❌ ...');
```

### ✅ Verification
```bash
NODE_ENV=production npm start 2>&1 | grep -c "console"
# Should return 0
```

---

## Task 1.2: Secure Secrets (1 hour)

### File: backend/server.js - Around Line 69-76

**BEFORE:**
```javascript
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-key',  // ❌ BAD
    resave: false,
    saveUninitialized: false,
    // ...
}));
```

**AFTER:**
```javascript
// ✅ Validate secrets exist
if (!process.env.SESSION_SECRET) {
    console.error('ERROR: SESSION_SECRET environment variable is required');
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
}

if (!process.env.JWT_SECRET) {
    console.error('ERROR: JWT_SECRET environment variable is required');
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
}

app.use(session({
    secret: process.env.SESSION_SECRET,  // ✅ No default
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

### Generate Secrets
```bash
# Generate 32-character random strings
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Run twice, save both outputs to .env file
```

### ✅ Verification
```bash
# Without secrets - should fail
NODE_ENV=production npm start
# Should exit with error message

# With secrets - should succeed
export SESSION_SECRET="your_32_char_random_string_here"
export JWT_SECRET="another_32_char_random_string_here"
NODE_ENV=production npm start
# Should start successfully
```

---

## Task 1.3: Create .env Files (30 minutes)

### Create: backend/.env.example
```bash
cat > backend/.env.example << 'EOF'
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=mahasu_user
DB_PASSWORD=change_me
DB_NAME=mahasu_ecommerce

# Server
NODE_ENV=production
PORT=5001

# Security - CHANGE THESE!
JWT_SECRET=change_me_to_random_32_character_string
SESSION_SECRET=change_me_to_random_32_character_string

# OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback

# Payment
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Frontend
FRONTEND_URL=https://yourdomain.com

# Logging
LOG_LEVEL=info
EOF
```

### Create: backend/.env.development
```bash
cat > backend/.env.development << 'EOF'
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=mahasu_ecommerce
JWT_SECRET=dev-jwt-secret-not-secure-change-in-prod
SESSION_SECRET=dev-session-secret-not-secure-change-in-prod
GOOGLE_CLIENT_ID=dev-client-id
GOOGLE_CLIENT_SECRET=dev-client-secret
RAZORPAY_KEY_ID=dev-key
RAZORPAY_KEY_SECRET=dev-secret
EMAIL_USER=dev@example.com
EMAIL_PASSWORD=dev-password
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=debug
EOF
```

### Create: my-app/.env.example
```bash
cat > my-app/.env.example << 'EOF'
VITE_API_URL=https://yourdomain.com/api
EOF
```

### ✅ Verification
```bash
ls -la backend/.env*
ls -la my-app/.env*
# Should show .env.example and .env.development
```

---

## Task 1.4: Add Account Lockout (3 hours)

### Step 1: Database Migration

**Create: backend/migrations/001_lockout.sql**
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS (
    login_attempts INT DEFAULT 0,
    locked_until DATETIME NULL,
    last_login DATETIME NULL,
    last_login_ip VARCHAR(45) NULL
);

CREATE INDEX IF NOT EXISTS idx_users_locked_until ON users(locked_until);
```

**Run migration:**
```bash
mysql -u root mahasu_ecommerce < backend/migrations/001_lockout.sql
# Or via Docker:
docker exec mahasu_db mysql -u root -p$DB_PASSWORD mahasu_ecommerce < backend/migrations/001_lockout.sql
```

### Step 2: Create Utility Module

**Create: backend/utils/accountLockout.js**
```javascript
const { getPool } = require('../config/db');

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000;

exports.isAccountLocked = async (userId) => {
    try {
        const pool = await getPool();
        const [[user]] = await pool.query(
            'SELECT locked_until FROM users WHERE id = ?',
            [userId]
        );
        
        if (!user || !user.locked_until) return false;
        
        const lockoutExpiry = new Date(user.locked_until);
        if (lockoutExpiry > new Date()) {
            return true;
        } else {
            await pool.query(
                'UPDATE users SET login_attempts = 0, locked_until = NULL WHERE id = ?',
                [userId]
            );
            return false;
        }
    } catch (error) {
        console.error('Error checking lock:', error);
        return false;
    }
};

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
        console.error('Error incrementing attempts:', error);
        throw error;
    }
};

exports.resetFailedAttempts = async (userId) => {
    try {
        const pool = await getPool();
        await pool.query(
            'UPDATE users SET login_attempts = 0, locked_until = NULL, last_login = NOW() WHERE id = ?',
            [userId]
        );
    } catch (error) {
        console.error('Error resetting attempts:', error);
    }
};
```

### Step 3: Update Authentication Controller

In **backend/controllers/userController.js**, update login function:

```javascript
const { 
    isAccountLocked, 
    incrementFailedAttempts, 
    resetFailedAttempts
} = require('../utils/accountLockout');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        
        const pool = await getPool();
        const [[user]] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Check if locked
        const locked = await isAccountLocked(user.id);
        if (locked) {
            return res.status(429).json({ 
                error: 'Account locked. Try again in 30 minutes.' 
            });
        }
        
        // Check password
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            const { locked: nowLocked } = await incrementFailedAttempts(user.id);
            if (nowLocked) {
                return res.status(429).json({ 
                    error: 'Account locked due to failed login attempts.' 
                });
            }
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Success
        await resetFailedAttempts(user.id);
        
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

### ✅ Verification
```bash
# Test with wrong password 6 times
for i in {1..6}; do
  curl -X POST http://localhost:5001/api/users/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
  echo ""
  sleep 1
done

# 6th attempt should return 429 with lock message
```

---

## Task 1.5: Add Database Indexes (1 hour)

**Create: backend/migrations/002_indexes.sql**
```sql
-- Critical indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_tag ON products(tag);
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
```

**Run migration:**
```bash
mysql -u root mahasu_ecommerce < backend/migrations/002_indexes.sql

# Verify
mysql -u root mahasu_ecommerce -e "SHOW INDEXES FROM users;"
```

---

## Task 1.6: Add Health Check Endpoint (30 minutes)

**In backend/server.js** (after middleware, before routes):
```javascript
// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const pool = await getPool();
        const connection = await pool.getConnection();
        await connection.query('SELECT 1');
        connection.release();
        
        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV,
            database: 'connected'
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: error.message,
            database: 'disconnected'
        });
    }
});
```

### ✅ Verification
```bash
curl http://localhost:5001/api/health
# Should return: {"status":"healthy","uptime":...,"database":"connected"}
```

---

## Task 1.7: Strengthen Rate Limiting (1 hour)

**In backend/middleware/security.js:**
```javascript
const createSecurity = (app) => {
    // Existing code...
    
    // Auth rate limiter (5 requests per 15 minutes)
    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 5,
        skipSuccessfulRequests: true,
        message: { error: 'Too many login attempts. Try again later.' }
    });
    
    // Password reset limiter
    const passwordResetLimiter = rateLimit({
        windowMs: 60 * 60 * 1000,
        max: 3,
        message: { error: 'Too many password reset attempts. Try again later.' }
    });
    
    app._authLimiter = authLimiter;
    app._passwordResetLimiter = passwordResetLimiter;
};
```

**In backend/server.js** (after middleware setup):
```javascript
// Apply limiters
app.use('/api/auth/', app._authLimiter);
app.use('/api/users/login', app._authLimiter);
app.use('/api/users/forgot-password', app._passwordResetLimiter);
```

---

## 📋 Phase 1 Completion Checklist

- [ ] **Task 1.1**: All console.logs removed
  - [ ] server.js cleaned
  - [ ] config/schema.js cleaned
  - [ ] config/db.js cleaned
  - [ ] Test: `NODE_ENV=production npm start` shows no console logs

- [ ] **Task 1.2**: Secrets properly secured
  - [ ] SESSION_SECRET required
  - [ ] JWT_SECRET required
  - [ ] No hardcoded defaults
  - [ ] Test: App fails without env vars in production

- [ ] **Task 1.3**: .env files created
  - [ ] `.env.example` created with all variables
  - [ ] `.env.development` created with dev values
  - [ ] `.env.production` template created
  - [ ] `my-app/.env.example` created

- [ ] **Task 1.4**: Account lockout implemented
  - [ ] Database columns added
  - [ ] Utility module created
  - [ ] Controller updated
  - [ ] Test: 6 failed attempts locks account

- [ ] **Task 1.5**: Database indexes created
  - [ ] 8 indexes created
  - [ ] Unique constraint on email
  - [ ] Test: `SHOW INDEXES FROM users` shows idx_users_email

- [ ] **Task 1.6**: Health check endpoint working
  - [ ] Endpoint created at `/api/health`
  - [ ] Returns JSON with status
  - [ ] Test: `curl http://localhost:5001/api/health` succeeds

- [ ] **Task 1.7**: Rate limiting strengthened
  - [ ] Auth endpoints limited to 5/15min
  - [ ] Password reset limited to 3/hour
  - [ ] Test: 6th login attempt returns 429

- [ ] **Final Testing**:
  - [ ] All endpoints still work
  - [ ] No console errors in production mode
  - [ ] Database migrations successful
  - [ ] Secrets properly required
  - [ ] Code committed with clear messages

---

## ✅ Ready for Phase 2!

Once all Phase 1 tasks are complete and tested:
1. Commit all changes
2. Deploy to staging
3. Run full regression test
4. Plan Phase 2 (High Priority Security)

**Time Estimate:** 15-20 hours  
**Team:** 1-2 developers  
**Difficulty:** Medium

🚀 **You've got this!**
