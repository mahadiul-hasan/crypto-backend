import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { authenticate } from "../../middleware/auth.middleware";
import { ClassSchema } from "./class.schema";
import { ClassController } from "./class.controller";
import { authorize } from "../../middleware/role.middleware";
import { Role } from "../../generated/prisma/enums";
import { validateSession } from "../../middleware/authGuard";

const router = Router();

router.use(authenticate);
router.use(validateSession);

router.get("/my", ClassController.getMyClasses);

router.use(authorize(Role.SUPER_ADMIN, Role.ADMIN));

router.get("/", ClassController.listClasses);
router.get("/:id", ClassController.getClass);
router.post(
  "/",
  validateRequest(ClassSchema.createClass),
  ClassController.createClass,
);
router.put(
  "/:id",
  validateRequest(ClassSchema.updateClass),
  ClassController.updateClass,
);
router.delete("/:id", ClassController.deleteClass);

export const ClassRoutes = router;
