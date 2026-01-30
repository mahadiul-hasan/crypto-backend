import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import fs from "fs";
import { NextFunction, Request, Response } from "express";

// Ensure logs directory exists
const logDir = "logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Custom log format for files
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Custom log format for console
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `[${timestamp}] ${level}: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
    }`;
  }),
);

// Create Winston logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: fileFormat,
  transports: [
    // Daily rotate file for all logs (keeps 7 days)
    new DailyRotateFile({
      filename: path.join(logDir, "application-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "7d", // Automatically removes logs older than 7 days
      level: "info",
    }),

    // Daily rotate file for errors only
    new DailyRotateFile({
      filename: path.join(logDir, "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "7d",
      level: "error",
    }),

    // Daily rotate file for HTTP requests
    new DailyRotateFile({
      filename: path.join(logDir, "http-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "7d",
      level: "http",
    }),
  ],
});

// Add console transport in non-production environments
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
      level: "debug",
    }),
  );
}

// HTTP request logger middleware
export const httpLogger = winston.createLogger({
  level: "http",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.json(),
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(logDir, "http-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "7d",
      level: "http",
    }),
  ],
});

// Custom HTTP logging middleware
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("user-agent"),
      userId: (req as any).user?.id || "anonymous",
    };

    httpLogger.http("HTTP Request", logData);
  });

  next();
};

export default logger;
