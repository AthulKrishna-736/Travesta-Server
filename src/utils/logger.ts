import fs from 'fs';
import { Writable } from 'stream';
import winston from 'winston';

const LOG_DIR = 'logs';
const MAX_LINES = 10000;

if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
}

const lineCounts: Record<string, number> = {
    'logs/combined.log': 0,
    'logs/error.log': 0
};

function wrapLogFileIfNeeded(filePath: string) {
    if (lineCounts[filePath] >= MAX_LINES) {
        fs.truncateSync(filePath, 0);
        lineCounts[filePath] = 0;
    }
}

function createLogStream(filePath: string): Writable {
    return new Writable({
        write(chunk, _encoding, callback) {
            wrapLogFileIfNeeded(filePath);
            fs.appendFileSync(filePath, chunk.toString());
            lineCounts[filePath]++;
            callback();
        }
    });
}

const customLogFormat = winston.format.printf(({ level, message, timestamp }) => {
    let coloredMessage = message;
    if (level === 'info') coloredMessage = `\x1b[34m${message}\x1b[0m`;
    else if (level === 'warn') coloredMessage = `\x1b[33m${message}\x1b[0m`;
    else if (level === 'error') coloredMessage = `\x1b[31m${message}\x1b[0m`;
    else if (level === 'success') coloredMessage = `\x1b[32m${message}\x1b[0m`;

    return `[${timestamp}] ${level.toUpperCase()}: ${coloredMessage}`;
});

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customLogFormat
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.Stream({
            stream: createLogStream('logs/error.log'),
            level: 'error'
        }),
        new winston.transports.Stream({
            stream: createLogStream('logs/combined.log')
        })
    ]
});

export default logger;