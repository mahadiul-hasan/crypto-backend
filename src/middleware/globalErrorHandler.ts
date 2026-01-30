import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Log the error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: (req as any).user?.id || "anonymous",
  });

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Prepare error response
  const errorResponse: any = {
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  // Handle specific error types
  if (err.name === "ValidationError") {
    errorResponse.message = "Validation Error";
    errorResponse.errors = err.errors;
  }

  if (err.code === 11000) {
    errorResponse.message = "Duplicate field value entered";
  }

  res.status(statusCode).json(errorResponse);
};

export default globalErrorHandler;
