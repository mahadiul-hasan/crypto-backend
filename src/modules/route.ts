import express from "express";
import { AuthRoutes } from "./auth/auth.route";
import { AdminRoutes } from "./admin/admin.route";
import { UserRoutes } from "./user/user.route";
import { CourseRoutes } from "./course/course.route";
import { BatchRoutes } from "./batch/batch.routes";
import { ClassRoutes } from "./class/class.routes";
import { PaymentRoutes } from "./payment/payment.route";
import { TagRoutes } from "./tag/tag.routes";
import { NotificationRoutes } from "./notification/notification.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/admin",
    route: AdminRoutes,
  },
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/course",
    route: CourseRoutes,
  },
  {
    path: "/batch",
    route: BatchRoutes,
  },
  {
    path: "/class",
    route: ClassRoutes,
  },
  {
    path: "/payment",
    route: PaymentRoutes,
  },
  {
    path: "/tag",
    route: TagRoutes,
  },
  {
    path: "/notification",
    route: NotificationRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
