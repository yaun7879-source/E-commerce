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

console.log('Loaded env from:', path.resolve(__dirname, '.env'));
console.log('GOOGLE_CLIENT_ID=', process.env.GOOGLE_CLIENT_ID ? 'loaded' : 'missing');
console.log('GOOGLE_CLIENT_SECRET=', process.env.GOOGLE_CLIENT_SECRET ? 'loaded' : 'missing');

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
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport middleware initialization
app.use(passport.initialize());
app.use(passport.session());

// Initialize Database (non-blocking)
(async () => {
    try {
        await initializeDatabase();
        console.log('✅ Database initialized successfully');
    } catch (error) {
        console.error('⚠️  Database initialization error:', error.message);
        console.log('⚠️  Server will continue, but database features may not work until connection is established.');
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
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'Backend is running!', timestamp: new Date() });
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
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📧 API Health Check: http://localhost:${PORT}/api/health\n`);
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
