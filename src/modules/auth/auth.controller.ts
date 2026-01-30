import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { Errors } from "../../utils/errorHelpers";

const register = async (req: Request, res: Response) => {
  await AuthService.register(req.body);
  res.status(201).json({ message: "Verification code sent" });
};

const verifyEmail = async (req: Request, res: Response) => {
  await AuthService.verifyEmail(req.body.email, req.body.code);
  res.json({ message: "Email verified" });
};

const resendVerificationCode = async (req: Request, res: Response) => {
  await AuthService.resendVerificationCode(req.body.email);
  res.json({ message: "Email verified" });
};

const login = async (req: Request, res: Response) => {
  const deviceId = req.headers["x-device-id"] as string;

  if (!deviceId) {
    throw Errors.BadRequest("Missing device id");
  }

  const tokens = await AuthService.login(req.body.email, req.body.password, {
    ip: req.ip || "",
    ua: req.headers["user-agent"] || "",
    deviceId,
  });

  // Cookie refresh
  res.cookie("refresh", tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/auth/refresh",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken: tokens.accessToken });
};

const refreshToken = async (req: Request, res: Response) => {
  const refresh = req.cookies.refresh;

  if (!refresh) {
    throw Errors.Unauthorized("No refresh token");
  }

  const deviceId = req.headers["x-device-id"] as string;

  if (!deviceId) {
    throw Errors.BadRequest("Missing device id");
  }

  const tokens = await AuthService.refreshToken(refresh, {
    ip: req.ip || "",
    ua: req.headers["user-agent"] || "",
    deviceId,
  });

  res.cookie("refresh", tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/auth/refresh",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken: tokens.accessToken });
};

const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const result = await AuthService.logout(refreshToken);
  res.json(result);
};

const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  const result = await AuthService.requestPasswordReset(email);
  res.json(result);
};

const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  await AuthService.resetPassword(token, newPassword);
  res.json({ message: "Password reset successful" });
};

const changePassword = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { currentPassword, newPassword } = req.body;

  const deviceId = req.headers["x-device-id"] as string;

  if (!deviceId) {
    throw Errors.BadRequest("Missing device id");
  }

  const result = await AuthService.changePassword(
    userId,
    currentPassword,
    newPassword,
    {
      ip: req.ip || "",
      ua: req.headers["user-agent"] || "",
      deviceId,
    },
  );

  res.json(result);
};

const getSessions = async (req: Request, res: Response) => {
  const sessions = await AuthService.getSessions(req.user!.sub);

  res.json(sessions);
};

const logoutOthersCtrl = async (req: Request, res: Response) => {
  const deviceId = req.headers["x-device-id"] as string;

  await AuthService.logoutOthers(req.user!.sub, deviceId);

  res.json({ message: "Other sessions removed" });
};

const logoutAll = async (req: Request, res: Response) => {
  await AuthService.logoutAll(req.user!.sub);

  res.clearCookie("refresh");

  res.json({ message: "Logged out everywhere" });
};

export const AuthController = {
  register,
  verifyEmail,
  resendVerificationCode,
  login,
  refreshToken,
  logout,
  logoutAll,
  requestPasswordReset,
  resetPassword,
  changePassword,
  getSessions,
  logoutOthersCtrl,
};
