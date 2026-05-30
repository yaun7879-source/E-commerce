const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const cors = require('cors');

const createSecurity = (app) => {
    // Basic security headers
    app.use(helmet());

    // Body / query sanitization against XSS
    app.use(xss());

    // Cookie parser (required for CSRF and cookie handling)
    app.use(cookieParser());

    // Global rate limiter (100 requests per 15 minutes)
    const globalLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'Too many requests, please try again later.' }
    });
    app.use(globalLimiter);

    // Auth rate limiter (5 requests per 15 minutes per IP)
    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 5,
        skipSuccessfulRequests: true,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'Too many login attempts. Please try again later.' }
    });

    // Password reset limiter (3 requests per hour)
    const passwordResetLimiter = rateLimit({
        windowMs: 60 * 60 * 1000,
        max: 3,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'Too many password reset attempts. Please try again later.' }
    });

    // Expose limiters for use in server.js
    app._authLimiter = authLimiter;
    app._passwordResetLimiter = passwordResetLimiter;

    // CORS: configured in server.js with allowed origins, but provide a safe default
    app.use(cors({ origin: false }));

    // CSRF protection
    try {
        const csrfProtection = csurf({ cookie: { httpOnly: true, sameSite: 'lax' } });
        app.use((req, res, next) => {
            next();
        });
        app._csrfProtection = csrfProtection;
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ CSRF middleware not attached:', err.message);
        }
    }
};

module.exports = createSecurity;
