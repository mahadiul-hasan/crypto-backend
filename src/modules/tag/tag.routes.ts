import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import { Role } from "../../generated/prisma/enums";
import { TagSchema } from "./tag.schema";
import { TagController } from "./tag.controller";
import { validateSession } from "../../middleware/authGuard";

const router = Router();

router.use(authenticate);
router.use(validateSession);
router.use(authorize(Role.SUPER_ADMIN, Role.ADMIN));

// List all tags with pagination
router.get("/", TagController.listTags);

// Create new tag
router.post("/", validateRequest(TagSchema.createTag), TagController.createTag);

// List tags for a course
router.get("/course/:courseId", TagController.listTagsByCourse);

// Attach tags to course
router.post(
  "/course/:courseId",
  validateRequest(TagSchema.attachDetachTags),
  TagController.attachTagsToCourse,
);

// Detach tags from course
router.delete(
  "/course/:courseId",
  validateRequest(TagSchema.attachDetachTags),
  TagController.detachTagsFromCourse,
);

export const TagRoutes = router;
