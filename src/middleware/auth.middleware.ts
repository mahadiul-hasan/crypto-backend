import { Request, Response, NextFunction } from "express";
import { Errors } from "../utils/errorHelpers";
import { verifyAccessToken } from "../utils/jwt";

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      throw Errors.Unauthorized("Missing token");
    }

    const token = auth.split(" ")[1];

    const decoded = verifyAccessToken(token);

    req.user = decoded as any;

    next();
  } catch (err) {
    next(Errors.Unauthorized("Invalid or expired token"));
  }
};
