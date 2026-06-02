const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');

// Try to load MySQL session store, fall back to memory store
let MySQLStore;
try {
    MySQLStore = require('express-mysql-session')(session);
} catch (err) {
    console.warn('⚠️  express-mysql-session not available, using MemoryStore');
    MySQLStore = null;
}

const createSecurity = require('./middleware/security');
const { errorHandler } = require('./middleware/errorHandler');
const { morganMiddleware } = require('./middleware/logger');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { initializeDatabase, getPool } = require('./config/schema');
const passport = require('./config/passport');

// Validate required environment variables
const validateEnv = () => {
    const required = ['JWT_SECRET', 'SESSION_SECRET'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0 && process.env.NODE_ENV === 'production') {
        console.error(`ERROR: Missing required environment variables: ${missing.join(', ')}`);
        process.exit(1);
    }

    if (missing.length > 0) {
        console.warn(`WARNING: Missing environment variables: ${missing.join(', ')}`);
    }
};

validateEnv();

// Async error wrapper for route handlers
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Import routes
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');
const paymentRoutes = require('./routes/payment');
const addressRoutes = require('./routes/addresses');
const reviewRoutes = require('./routes/reviews');
const authRoutes = require('./routes/auth');
const subscriptionRoutes = require('./routes/subscriptions');
const returnRoutes = require('./routes/returns');
const cancellationRoutes = require('./routes/cancellations');
const faqRoutes = require('./routes/faqs');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware and security
// Trust proxy when behind a load balancer (required for secure cookies)
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// CORS Configuration - Allow multiple origins for OAuth callback
// IMPORTANT: CORS must be applied BEFORE security headers
const allowedOrigins = [
    'http://localhost:3000',      // Local frontend
    'http://localhost:5173',      // Vite dev server
    'http://localhost',           // Local production
    process.env.FRONTEND_URL,     // Production frontend URL (from env)
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g., mobile apps, curl, native apps)
        if (!origin) return callback(null, true);

        // Check if origin is in allowed list
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }

        // Allow any Vercel deployment domain (more flexible)
        if (origin && origin.includes('vercel.app')) {
            return callback(null, true);
        }

        // Allow localhost variants for development
        if (origin && origin.includes('localhost')) {
            return callback(null, true);
        }

        console.warn(`⚠️ CORS blocked origin: ${origin}`);
        return callback(new Error('CORS policy: This origin is not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count', 'Authorization'],
    maxAge: 86400 // Cache preflight requests for 24 hours
};

// Apply CORS FIRST, before security headers
app.use(cors(corsOptions));
// Explicit preflight handler for all routes
app.options('*', cors(corsOptions));

app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));

// Apply security helpers AFTER CORS (helmet, rate-limit, xss-clean, cookie-parser)
createSecurity(app);

// Request logging
app.use(morganMiddleware);

// Session middleware for Passport
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
    throw new Error('SESSION_SECRET environment variable is required');
}

// Use MySQL session store in production (if available), memory store otherwise
let sessionStore;
if (process.env.NODE_ENV === 'production' && MySQLStore) {
    try {
        const { config } = require('./config/db');
        sessionStore = new MySQLStore({
            host: config.host,
            user: config.user,
            password: config.password,
            database: config.database,
            port: config.port,
            clearExpired: true,
            expiration: 24 * 60 * 60 * 1000,
            createDatabaseTable: true,
            charset: 'utf8mb4_bin'
        });
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ MySQL session store initialized');
        }
    } catch (err) {
        console.warn('⚠️  Could not initialize MySQL session store:', err.message);
        sessionStore = new session.MemoryStore();
    }
} else {
    // Use memory store for development or if MySQL store unavailable
    sessionStore = new session.MemoryStore();
    if (process.env.NODE_ENV === 'production') {
        console.warn('⚠️  Using MemoryStore in production - install express-mysql-session for production-ready session management');
    }
}

app.use(session({
    store: sessionStore,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Passport middleware initialization
app.use(passport.initialize());
app.use(passport.session());

// Initialize Database (non-blocking)
(async () => {
    try {
        await initializeDatabase();
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Database initialized successfully');
        }
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('⚠️  Database initialization error:', error.message);
        }
    }
})();

// Root route - API information
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Mahasu E-Commerce API Server',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/api/health',
            products: '/api/products',
            users: '/api/users',
            orders: '/api/orders',
            cart: '/api/cart',
            payment: '/api/payment',
            addresses: '/api/addresses',
            reviews: '/api/reviews',
            auth: '/api/auth'
        },
        frontend: process.env.FRONTEND_URL || 'Not configured',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/cancellations', cancellationRoutes);
app.use('/api/faqs', faqRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const { getPool } = require('./config/db');
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
            database: 'disconnected',
            timestamp: new Date().toISOString()
        });
    }
});

// Expose CSRF token endpoint when csurf is available on app
if (app._csrfProtection) {
    app.get('/api/csrf-token', app._csrfProtection, (req, res) => {
        res.json({ csrfToken: req.csrfToken() });
    });
}

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
// Centralized error handler (hides stack traces in production)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`\n🚀 Server running on http://localhost:${PORT}`);
        console.log(`📧 API Health Check: http://localhost:${PORT}/api/health\n`);
    }
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use. Please stop the other process or set a different PORT in backend/.env.`);
        process.exit(1);
    }
    console.error(err);
    process.exit(1);
});

module.exports = app;
