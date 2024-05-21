require('dotenv').config();
const fs = require('fs');
const path = require('path');

const winston = require('winston');
const { LogtailTransport } = require('@logtail/winston');
const { Logtail } = require('@logtail/node');

require('winston-daily-rotate-file');

const logtail = new Logtail(process.env.LOG_KEY);

// Create a 'logs' directory if it doesn't exist
const logDirectory = path.join(__dirname, 'logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// Winston transport for daily rotating log files
const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDirectory, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d', // Keep logs for the last 14 days
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'xkorin_log_system' },
  transports: [
    new winston.transports.Console(),
    new LogtailTransport(logtail),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    dailyRotateFileTransport,
  ],
});

module.exports = logger;
