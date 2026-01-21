import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development (more readable)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

// File transport with daily rotation
const fileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'api_requests-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: logFormat,
  level: process.env.LOG_LEVEL || 'http'
});

// Console transport for development
const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
  level: process.env.LOG_LEVEL || 'http'
});

// Create the logger instance
const logger = winston.createLogger({
  levels: winston.config.npm.levels,
  transports: [
    fileTransport,
    consoleTransport
  ],
  exitOnError: false
});

// Create a stream for Morgan or similar middleware (if needed later)
export const logStream = {
  write: (message: string) => {
    logger.http(message.trim());
  }
};

export default logger;
