import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser"; // Added: Required for csurf
import csurf from "csurf";
import globalErrorHandler from "./middleware/globalErrorHandler";
import { securityMiddleware } from "./middleware/security";
import logger, { requestLogger } from "./utils/logger";
import { LogManager } from "./utils/logManager";
import router from "./modules/route";

const app = express();

// 1. Trust Proxy (Must be first for rate-limiting & IP logs)
app.set("trust proxy", 1);

// 2. Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser()); // Must come before csurf

// 3. CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(",")
      : ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

// 4. Security (Includes Helmet, Compression, and Rate Limiting)
app.use(securityMiddleware);

// 5. CSRF Protection (Note: csurf is technically deprecated, consider csrf-csrf in the future)
app.use(csurf({ cookie: true }));

// 6. Logging
app.use(requestLogger);
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.http(message.trim()) },
  }),
);

// 7. Routes
app.use("/api", router);

app.get("/health", (_, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 8. Error Handling
app.use(globalErrorHandler);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Cleanup Logic
LogManager.cleanupOldLogs(7);
setInterval(() => LogManager.cleanupOldLogs(7), 24 * 60 * 60 * 1000);

export default app;
