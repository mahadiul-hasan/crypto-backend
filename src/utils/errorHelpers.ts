import { AppError } from "./AppError";

// Common error types for consistency
export const Errors = {
  // 400 Bad Request
  BadRequest: (message: string = "Bad Request") => new AppError(message, 400),

  // 401 Unauthorized
  Unauthorized: (message: string = "Unauthorized") =>
    new AppError(message, 401),

  // 403 Forbidden
  Forbidden: (message: string = "Forbidden") => new AppError(message, 403),

  // 404 Not Found
  NotFound: (message: string = "Not Found") => new AppError(message, 404),

  // 409 Conflict
  Conflict: (message: string = "Conflict") => new AppError(message, 409),

  // 422 Validation Error
  ValidationError: (message: string = "Validation Error") =>
    new AppError(message, 422),

  // 500 Internal Server Error
  InternalServerError: (message: string = "Internal Server Error") =>
    new AppError(message, 500),
};

// Validation helper
export const validateRequired = (
  fields: Record<string, any>,
  fieldNames: string[],
) => {
  const missingFields: string[] = [];

  fieldNames.forEach((field) => {
    if (
      fields[field] === undefined ||
      fields[field] === null ||
      fields[field] === ""
    ) {
      missingFields.push(field);
    }
  });

  if (missingFields.length > 0) {
    throw Errors.BadRequest(
      `Missing required fields: ${missingFields.join(", ")}`,
    );
  }
};
