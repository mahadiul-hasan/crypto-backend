import { Request, Response } from "express";
import { AuthService } from "./auth.service";

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
  const tokens = await AuthService.login(req.body.email, req.body.password);
  res.json(tokens);
};

const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const tokens = await AuthService.refreshToken(refreshToken);
  res.json(tokens);
};

const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const result = await AuthService.logout(refreshToken);
  res.json(result);
};

const logoutAll = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  await AuthService.logoutAll(userId);
  res.json({ message: "Logged out from all sessions" });
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

  const result = await AuthService.changePassword(
    userId,
    currentPassword,
    newPassword,
  );

  res.json(result);
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
};
