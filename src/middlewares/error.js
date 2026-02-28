/**
 * Centralized error handling middleware
 */
const logger = require('./logger');

const errorMiddleware = (err, req, res, next) => {
    logger.error(`[Error] ${err.message}`, {
        stack: err.stack,
        originalUrl: req.originalUrl,
        method: req.method
    });

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
};

module.exports = errorMiddleware;
