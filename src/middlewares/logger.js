const winston = require("winston");
const path = require("path");
const DailyRotateFile = require("winston-daily-rotate-file");

// Create the logger instance
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: "tenant-mgmt-backend" },
  transports: [
    // Write all logs with level `error` and below to `error-%DATE%.log`
    new DailyRotateFile({
      filename: path.join(__dirname, "../../logs/error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      level: "error",
    }),
    // Write all logs with level `info` and below to `combined-%DATE%.log`
    new DailyRotateFile({
      filename: path.join(__dirname, "../../logs/combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

// If we're not in production then log to the `console` as well
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}

module.exports = logger;
