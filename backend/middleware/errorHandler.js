const winston = require('winston');

// Simple Winston logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    transports: [new winston.transports.Console({ format: winston.format.simple() })]
});

const errorHandler = (err, req, res, next) => {
    logger.error(err.stack || err.message || err);

    const status = err.status || 500;
    const response = {
        error: err.message || 'Internal server error',
        timestamp: new Date().toISOString(),
    };

    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    res.status(status).json(response);
};

module.exports = { errorHandler, logger };
