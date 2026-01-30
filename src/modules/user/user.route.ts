import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { authenticate } from "../../middleware/auth.middleware";
import { UserSchema } from "./user.schema";
import { validateSession } from "../../middleware/authGuard";

const router = Router();

router.use(authenticate);
router.use(validateSession);

router.get("/me", UserController.getProfile);

router.put(
  "/profile",
  validateRequest(UserSchema.updateProfile),
  UserController.updateProfile,
);

router.put(
  "/wallets",
  validateRequest(UserSchema.updateWallets),
  UserController.updateWallets,
);

export const UserRoutes = router;
