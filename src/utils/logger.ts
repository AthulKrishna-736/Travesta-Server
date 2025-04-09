import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ level, message, timestamp }) => {
            let coloredMessage = message;
            if (level === 'info') {
                coloredMessage = `\x1b[34m${message}\x1b[0m`; // Blue
            } else if (level === 'warn') {
                coloredMessage = `\x1b[33m${message}\x1b[0m`; // Yellow
            } else if (level === 'error') {
                coloredMessage = `\x1b[31m${message}\x1b[0m`; // Red
            } else if (level === 'success') {
                coloredMessage = `\x1b[32m${message}\x1b[0m`; // Green
            }
            return `[${timestamp}] ${level.toUpperCase()}: ${coloredMessage}`
        }) 
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ]
})

export default logger;