import { NextFunction, Request, Response } from "express";
import { Errors } from "../utils/errorHelpers";
import jwt from "jsonwebtoken";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      throw Errors.Unauthorized("Access denied. No token provided.");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;

    next();
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      error.message = "Invalid token";
      error.statusCode = 401;
    }

    if (error.name === "TokenExpiredError") {
      error.message = "Token expired";
      error.statusCode = 401;
    }

    next(error);
  }
};
