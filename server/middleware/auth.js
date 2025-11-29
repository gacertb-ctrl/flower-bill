// server/middleware/auth.js
const jwt = require('jsonwebtoken');

// Session-based middleware
const sessionProtect = (req, res, next) => {
    if (!req.session.user_id) {
        return res.status(401).send('Unauthorized');
    }
    next();
};

// Token-based middleware
const tokenProtect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = {
    sessionProtect,
    tokenProtect
};
