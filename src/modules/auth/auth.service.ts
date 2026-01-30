import { prisma } from "../../configs/prisma";
import { verifyPassword } from "../../utils/password";
import { generateRefreshToken, signAccessToken } from "../../utils/jwt";
import { RegisterData, RegisterResponse } from "../../types/auth";
import {
  determineUserRole,
  generateVerificationCode,
  invalidateOldCodes,
} from "../../utils/auth";
import { authEventEmitter } from "./auth.events";
import { checkEmailRateLimit } from "../../utils/emailRateLimit";
import { AppError } from "../../utils/AppError";
import { redisConnection } from "../../configs/redis";
import { Errors } from "../../utils/errorHelpers";
import { env } from "../../configs/env";
import bcrypt from "bcryptjs";
import { hashRefreshToken } from "../../utils/tokenHash";
import {
  logoutOthers as sessionLogoutOthers,
  invalidateAllSessions,
  saveSession,
  invalidateSession,
  listSessions,
} from "../../services/session.service";

const register = async (data: RegisterData): Promise<RegisterResponse> => {
  const isExist = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true },
  });

  if (isExist) {
    throw new AppError("User not found", 404);
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const role = determineUserRole(data.email);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Create user role
    await tx.userRole.create({
      data: {
        userId: user.id,
        role: role,
      },
    });

    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await tx.emailVerificationCode.create({
      data: {
        userId: user.id,
        code: verificationCode,
        expiresAt,
      },
    });

    return { user, verificationCode, role };
  });

  authEventEmitter.emit("auth.user.registered", {
    email: result.user.email,
    name: result.user.name,
    verificationCode: result.verificationCode,
  });

  return {
    user: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.role,
    },
    verificationCodeSent: true,
  };
};

const verifyEmail = async (email: string, code: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const record = await prisma.emailVerificationCode.findFirst({
    where: {
      userId: user.id,
      code,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) {
    throw new AppError("Invalid or expire code", 404);
  }

  await prisma.$transaction([
    prisma.emailVerificationCode.update({
      where: { id: record.id },
      data: { used: true },
    }),
    prisma.user.update({
      where: { email },
      data: { isEmailVerified: true },
    }),
  ]);
};

const resendVerificationCode = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isEmailVerified) {
    throw new AppError("Email already verified", 404);
  }

  // Redis rate-limit enforcement
  await checkEmailRateLimit(user.id);

  // Invalidate old codes
  await invalidateOldCodes(user.id);

  const verificationCode = generateVerificationCode();

  await prisma.emailVerificationCode.create({
    data: {
      userId: user.id,
      code: verificationCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  // Async email
  authEventEmitter.emit("auth.user.resend.verification", {
    email: user.email,
    name: user.name,
    verificationCode,
  });

  return { message: "Verification code sent" };
};

const login = async (
  email: string,
  password: string,
  meta: {
    ip: string;
    ua: string;
    deviceId: string;
  },
) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { roles: true },
  });

  if (!user || !user.isEmailVerified) {
    throw new AppError("User not found", 404);
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw new AppError("Invalid credentials", 404);
  }

  const role = user.roles[0]?.role ?? "USER";

  const accessToken = signAccessToken(user.id, role);

  const refreshToken = generateRefreshToken();

  await saveSession(user.id, refreshToken, meta);

  return { accessToken, refreshToken };
};

const refreshToken = async (
  token: string,
  meta: {
    ip: string;
    ua: string;
    deviceId: string;
  },
) => {
  const hashed = hashRefreshToken(token);

  const userId = await redisConnection.get(`auth:refresh:${hashed}`);

  // REUSE DETECTED
  if (!userId) {
    // Possible theft
    throw Errors.Unauthorized("Session compromised");
  }

  await invalidateSession(token);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: true },
  });

  if (!user) throw Errors.BadRequest("User not found");

  const newRefresh = generateRefreshToken();

  await saveSession(user.id, newRefresh, meta);

  return {
    accessToken: signAccessToken(user.id, user.roles[0]?.role ?? "USER"),
    refreshToken: newRefresh,
  };
};

const logout = async (refreshToken: string) => {
  await invalidateSession(refreshToken);
  return { message: "Logged out" };
};

const requestPasswordReset = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw Errors.BadRequest("User not found");

  const token = crypto.randomUUID();

  const resetLink = `${env.FRONTEND_URL}/password-reset?token=${token}`;

  await redisConnection.set(`auth:pwdreset:${token}`, user.id, "EX", 600);

  authEventEmitter.emit("auth.user.password.reset.request", {
    email: user.email,
    name: user.name,
    resetLink,
  });

  return { message: "If email exists, reset link sent" };
};

const resetPassword = async (token: string, newPassword: string) => {
  const userId = await redisConnection.get(`auth:pwdreset:${token}`);
  if (!userId) throw Errors.Unauthorized("Invalid or expired token");

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  await redisConnection.del(`auth:pwdreset:${token}`);
  await invalidateAllSessions(userId);
};

const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
  meta: {
    ip: string;
    ua: string;
    deviceId: string;
  },
) => {
  if (currentPassword === newPassword) {
    throw Errors.BadRequest("New password must be different");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw Errors.BadRequest("User not found");
  }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!isValid) {
    throw Errors.ValidationError("Current password is incorrect");
  }

  const newHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

  // 🔥 Kill all active sessions
  await invalidateAllSessions(userId);

  // Issue new tokens
  const accessToken = signAccessToken(userId, "USER");
  const refreshToken = generateRefreshToken();
  await saveSession(userId, refreshToken, meta);

  return {
    message: "Password changed successfully",
    accessToken,
    refreshToken,
  };
};

const getSessions = async (userId: string) => {
  return await listSessions(userId);
};

const logoutOthers = async (userId: string, deviceId: string) => {
  await sessionLogoutOthers(userId, deviceId);
};

const logoutAll = async (userId: string) => {
  await invalidateAllSessions(userId);
};

export const AuthService = {
  register,
  verifyEmail,
  resendVerificationCode,
  login,
  refreshToken,
  logout,
  requestPasswordReset,
  resetPassword,
  changePassword,
  getSessions,
  logoutOthers,
  logoutAll,
};
