import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { AuthSchema } from "./auth.schema";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.post(
  "/register",
  validateRequest(AuthSchema.registerSchema),
  AuthController.register,
);

router.post(
  "/verify-email",
  validateRequest(AuthSchema.verifyEmailSchema),
  AuthController.verifyEmail,
);

router.post("/resend-verification-code", AuthController.resendVerificationCode);

router.post(
  "/login",
  validateRequest(AuthSchema.loginSchema),
  AuthController.login,
);

router.post("/request-reset-password", AuthController.requestPasswordReset);

router.post("/reset-password", AuthController.resetPassword);

router.use(authenticate);

router.post("/refresh-token", AuthController.refreshToken);

router.post("/logout", AuthController.logout);

router.post("/logout-all", AuthController.logoutAll);

router.post(
  "/change-password",
  validateRequest(AuthSchema.changePasswordSchema),
  AuthController.changePassword,
);

export const AuthRoutes = router;
