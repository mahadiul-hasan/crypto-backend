// routes/notification.routes.ts
import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { NotificationController } from "./notification.controller";
import { authorize } from "../../middleware/role.middleware";
import { Role } from "../../generated/prisma/enums";

const router = Router();

router.use(authenticate);

router.use(authorize(Role.SUPER_ADMIN, Role.ADMIN));

router.get("/", NotificationController.listNotifications);

router.patch("/:id/read", NotificationController.markNotificationRead);

router.delete("/:id", NotificationController.deleteNotification);

export const NotificationRoutes = router;
