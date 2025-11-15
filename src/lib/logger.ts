import winston from "winston";

const { combine, timestamp, printf, json, errors } = winston.format;

// custom human  readable formatter for console
const consoleFormat = printf(
  ({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} ${level}: ${stack || message}${metaStr}`;
  }
);

// create logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports: [
    // console (human-friendly)
    new winston.transports.Console({
      format: combine(timestamp(), errors({ stack: true }), consoleFormat),
    }),
    // file (structured JSON)
    new winston.transports.File({
      filename: "logs/app.log",
      level: "info",
      handleExceptions: true,
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
    // Optionally add rotated files (requires winston-daily-rotate-file):
    // new (winston.transports as any).DailyRotateFile({
    //   filename: 'logs/%DATE%-app.log',
    //   datePattern: 'YYYY-MM-DD',
    //   maxFiles: '14d',
    // })
  ],
});
