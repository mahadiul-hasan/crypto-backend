import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import fs from "fs";
import { NextFunction, Request, Response } from "express";

const logDir = "logs";
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

// Filter helper by log level
const filterOnly = (level: string) =>
  winston.format((info) => (info.level === level ? info : false))();

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString =
      Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : "";
    return `[${timestamp}] ${level}: ${message} ${metaString}`;
  }),
);

const transports: winston.transport[] = [
  new DailyRotateFile({
    filename: path.join(logDir, "error-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "7d",
    level: "error",
    format: winston.format.combine(filterOnly("error"), fileFormat),
  }),

  new DailyRotateFile({
    filename: path.join(logDir, "http-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "7d",
    level: "http",
    format: winston.format.combine(filterOnly("http"), fileFormat),
  }),

  new DailyRotateFile({
    filename: path.join(logDir, "application-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "7d",
    level: "info",
    format: winston.format.combine(filterOnly("info"), fileFormat),
  }),
];

// Add console logging if not production
if (process.env.NODE_ENV !== "production") {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: "debug",
    }),
  );
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transports,
});

// HTTP request logging middleware
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    logger.http("HTTP Request", {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.headers["x-forwarded-for"] || req.ip,
      userAgent: req.get("user-agent"),
      userId: (req as any).user?.id || "anonymous",
    });
  });

  next();
};

export default logger;
