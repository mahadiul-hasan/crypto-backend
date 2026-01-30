import { NextFunction, Request, Response } from "express";
import { hashRefreshToken } from "../utils/tokenHash";
import { redisConnection } from "../configs/redis";

export const validateSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const hash = hashRefreshToken(token);
  const sessionExists = await redisConnection.exists(`auth:refresh:${hash}`);

  if (!sessionExists) {
    return res.status(401).json({ message: "Session expired or revoked" });
  }

  next();
};
