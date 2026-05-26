const jwt = require('jsonwebtoken');

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: 'Invalid token' });
            }
            req.userId = decoded.userId;
            req.userEmail = decoded.email;
            next();
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { verifyToken };
