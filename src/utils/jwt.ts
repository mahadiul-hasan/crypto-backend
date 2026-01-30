import jwt from "jsonwebtoken";
import { env } from "../configs/env";
import crypto from "crypto";

const ACCESS_EXPIRES = "15m";
const ISSUER = "Crypto_lms";
const AUDIENCE = "Crypto_lms_users";

export function signAccessToken(userId: string, role: string) {
  return jwt.sign(
    {
      sub: userId,
      role,
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: ACCESS_EXPIRES,
      issuer: ISSUER,
      audience: AUDIENCE,
    },
  );
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: ISSUER,
    audience: AUDIENCE,
  });
}

export function generateRefreshToken() {
  return crypto.randomBytes(64).toString("hex");
}
