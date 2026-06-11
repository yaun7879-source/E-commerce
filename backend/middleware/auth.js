const jwt = require('jsonwebtoken');

const extractTokenFromRequest = (req) => {
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) return authHeader.split(' ')[1];
    if (req.cookies && req.cookies.token) return req.cookies.token;
    return null;
};

const verifyToken = (req, res, next) => {
    try {
        const token = extractTokenFromRequest(req);
        if (token) {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            req.user = { id: payload.userId, email: payload.email };
            return next();
        }

        if (req.user) {
            return next();
        }

        if (req.isAuthenticated && req.isAuthenticated()) {
            return next();
        }

        return res.status(401).json({ error: 'Authentication token missing' });
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = verifyToken;
module.exports.verifyToken = verifyToken;
module.exports.extractTokenFromRequest = extractTokenFromRequest;
