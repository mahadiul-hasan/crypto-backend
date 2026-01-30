import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { Request, Response, NextFunction } from "express";

// Define instances OUTSIDE the middleware function to maintain state
const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Slightly higher than 5 to account for session listing/logout
  message: "Too many auth requests. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const securityMiddleware = [
  helmet(), // Sets secure HTTP headers
  compression(), // Gzip compression

  // Selective Rate Limiting
  (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api/auth")) {
      return authLimiter(req, res, next);
    }
    return defaultLimiter(req, res, next);
  },
];
