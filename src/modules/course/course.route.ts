import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import { Role } from "../../generated/prisma/enums";
import { AdminCourseSchema } from "./course.schema";
import { CourseController } from "./course.controller";

const router = Router();

router.get("/", CourseController.listCourses);
router.get("/:id", CourseController.getCourse);

router.use(authenticate);
router.use(authorize(Role.SUPER_ADMIN, Role.ADMIN));

router.post(
  "/",
  validateRequest(AdminCourseSchema.createCourse),
  CourseController.createCourse,
);
router.put(
  "/:id",
  validateRequest(AdminCourseSchema.updateCourse),
  CourseController.updateCourse,
);
router.delete("/:id", CourseController.deleteCourse);

export const CourseRoutes = router;
