import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { Request, Response, NextFunction } from "express";

// Rate limiting configuration
export const createRateLimiter = (options?: {
  windowMs?: number;
  max?: number;
  message?: string;
}) => {
  return rateLimit({
    windowMs: options?.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options?.max || 100, // Limit each IP to 100 requests per windowMs
    message:
      options?.message ||
      "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return req.ip || "unknown";
    },
  });
};

// Security middleware
export const securityMiddleware = [
  // Helmet for security headers
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: "deny" },
    noSniff: true,
    xssFilter: true,
  }),

  // Compression for responses
  compression(),

  // Remove X-Powered-By header
  (_req: Request, res: Response, next: NextFunction) => {
    res.removeHeader("X-Powered-By");
    next();
  },

  // Rate limiting for auth endpoints (stricter)
  (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api/auth")) {
      return createRateLimiter({
        windowMs: 15 * 60 * 1000,
        max: 5, // Only 5 requests per 15 minutes for auth endpoints
        message: "Too many authentication attempts. Please try again later.",
      })(req, res, next);
    }
    next();
  },
];
