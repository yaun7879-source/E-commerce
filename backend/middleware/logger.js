const morgan = require('morgan');
const winston = require('winston');

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    transports: [
        new winston.transports.Console({ format: winston.format.simple() }),
        // Add file transport for production
        // new winston.transports.File({ filename: 'logs/app.log' })
    ],
});

const morganMiddleware = morgan('combined', {
    stream: {
        write: (message) => logger.info(message.trim()),
    },
});

module.exports = { logger, morganMiddleware };
