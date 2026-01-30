import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import { Role } from "../../generated/prisma/enums";
import { AdminController } from "./admin.controller";

const router = Router();

router.use(authenticate);
router.use(authorize(Role.SUPER_ADMIN, Role.ADMIN));

// Get logs for admin dashboard
router.get("/logs", AdminController.getLogs);

// Get log statistics
router.get("/logs/stats", AdminController.getLogStats);

// Clean old logs manually
router.post("/logs/cleanup", AdminController.cleanLogs);

// Download logs
router.get("/logs/download", AdminController.downloadLogs);

router.get("/users", AdminController.listUsers);

router.get("/user/:id", AdminController.deleteUser);

router.get("/analytics", AdminController.getAnalytics);

router.post("/users/:id/logout", AdminController.forceLogoutUser);

export const AdminRoutes = router;
