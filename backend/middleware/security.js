const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const cors = require('cors');

const createSecurity = (app) => {
    // Basic security headers with cross-origin support
    // IMPORTANT: These settings allow CORS to work properly
    app.use(helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                connectSrc: [
                    "'self'",
                    "https://e-commerce-k5cv.vercel.app",
                    "https://*.vercel.app",
                    "https://e-commerce-production-1f1f.up.railway.app",
                    "https://checkout.razorpay.com",
                    "http://localhost:5173",
                    "http://localhost:3000"
                ],
                scriptSrc: ["'self'", "https://checkout.razorpay.com"],
                frameSrc: ["https://checkout.razorpay.com"]
            }
        }
    }));

    // Body / query sanitization against XSS and NoSQL injection
    app.use(xss());
    app.use(mongoSanitize());

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
