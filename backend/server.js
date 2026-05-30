const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const createSecurity = require('./middleware/security');
const { errorHandler } = require('./middleware/errorHandler');
const { morganMiddleware } = require('./middleware/logger');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { initializeDatabase } = require('./config/schema');
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

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware and security
// Trust proxy when behind a load balancer (required for secure cookies)
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Apply security helpers (helmet, rate-limit, xss-clean, cookie-parser)
createSecurity(app);

// Request logging
app.use(morganMiddleware);

// CORS Configuration - Allow multiple origins for OAuth callback
const allowedOrigins = [
    'http://localhost:3000',      // Local frontend
    'http://localhost:5173',      // Vite dev server
    process.env.FRONTEND_URL,     // Production frontend URL
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g., mobile apps, curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        return callback(new Error('CORS policy: This origin is not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));

// Session middleware for Passport
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
    throw new Error('SESSION_SECRET environment variable is required');
}

app.use(session({
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

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/auth', app._authLimiter, authRoutes);

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
