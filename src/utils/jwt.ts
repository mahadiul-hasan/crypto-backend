import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../configs/env";

const ACCESS_EXPIRES = "15m";

export function signAccessToken(userId: string, role: string) {
  return jwt.sign({ sub: userId, role }, env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES,
  });
}

export function generateRefreshToken() {
  return crypto.randomUUID();
}
