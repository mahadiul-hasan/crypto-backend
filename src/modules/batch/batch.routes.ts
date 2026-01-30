import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { BatchSchema } from "./batch.schema";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import { Role } from "../../generated/prisma/enums";
import { BatchController } from "./batch.controller";

const router = Router();

router.get("/public", BatchController.listPublicBatches);

router.use(authenticate);

router.get("/my", BatchController.getMyBatches);

router.use(authorize(Role.SUPER_ADMIN, Role.ADMIN));

router.get("/", BatchController.listBatches);
router.get("/:id", BatchController.getBatch);
router.post(
  "/",
  validateRequest(BatchSchema.createBatch),
  BatchController.createBatch,
);
router.put(
  "/:id",
  validateRequest(BatchSchema.updateBatch),
  BatchController.updateBatch,
);
router.delete("/:id", BatchController.deleteBatch);

export const BatchRoutes = router;
