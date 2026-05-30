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

    // Rate limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'Too many requests, please try again later.' }
    });
    app.use(limiter);

    // CORS: configured in server.js with allowed origins, but provide a safe default
    app.use(cors({ origin: false }));

    // CSRF protection: enabled only when cookies are used (session or cookie auth)
    // We'll attach a csrf token route in server.js when needed.
    // Note: csurf requires cookie-parser and that the frontend reads the token and sends it back in a header.
    try {
        const csrfProtection = csurf({ cookie: { httpOnly: true, sameSite: 'lax' } });
        app.use((req, res, next) => {
            // Enable CSRF only for state-changing requests when cookies are present
            // We don't apply csrfProtection globally here to avoid breaking token-based APIs.
            next();
        });
        app._csrfProtection = csrfProtection; // expose for server.js to use on specific routes
    } catch (err) {
        // csurf might throw if environment doesn't support cookies - ignore but log
        console.warn('⚠️ CSRF middleware not attached:', err.message);
    }
};

module.exports = createSecurity;
