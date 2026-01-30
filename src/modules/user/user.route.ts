import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { authenticate } from "../../middleware/auth.middleware";
import { UserSchema } from "./user.schema";

const router = Router();

router.use(authenticate); // protect all user routes

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
