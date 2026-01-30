import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import globalErrorHandler from "./middleware/globalErrorHandler";
import { securityMiddleware } from "./middleware/security";
import { requestLogger } from "./utils/logger";
import { createRateLimiter } from "./middleware/security";
import logger from "./utils/logger";
import { LogManager } from "./utils/logManager";
import router from "./modules/route";
import csurf from "csurf";

const app = express();

// Core middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(",")
      : ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Security middlewares
app.use(securityMiddleware);
app.use(csurf({ cookie: true }));

// Rate limiting for all routes (general)
app.use(
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: "Too many requests from this IP, please try again later.",
  }),
);

// HTTP logging
app.use(requestLogger);

// Morgan for HTTP logging (optional, can use our custom logger instead)
app.use(
  morgan("combined", {
    stream: {
      write: (message: string) => {
        logger.http(message.trim());
      },
    },
  }),
);

// Routes
app.use("/api", router);

// Health check
app.get("/health", (_, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Clean old logs on startup and schedule daily cleanup
LogManager.cleanupOldLogs(7);
setInterval(
  () => {
    LogManager.cleanupOldLogs(7);
  },
  24 * 60 * 60 * 1000,
); // Run daily

// Global error handler (should be after all routes)
app.use(globalErrorHandler);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global error fallback (last)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error("Unhandled error:", err);
  res.status(500).json({
    message: "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && {
      error: err.message,
      stack: err.stack,
    }),
  });
});

export default app;
