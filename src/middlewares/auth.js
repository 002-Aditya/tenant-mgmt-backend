const jwt = require('jsonwebtoken');
const logger = require('./logger');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        logger.warn('Authentication blocked: No token provided');
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key');
        req.user = verified;
        next();
    } catch (error) {
        logger.error(`Authentication failed: Invalid token - ${error.message}`);
        res.status(403).json({ success: false, message: 'Invalid token.' });
    }
};

module.exports = authenticateToken;