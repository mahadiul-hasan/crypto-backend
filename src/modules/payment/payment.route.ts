import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import { PaymentController } from "./payment.controller";
import { PaymentSchema } from "./payment.schema";
import { Role } from "../../generated/prisma/enums";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  validateRequest(PaymentSchema.create),
  PaymentController.submitPayment,
);

router.get("/my", PaymentController.myPayments);

router.use(authorize(Role.SUPER_ADMIN, Role.ADMIN));

router.get("/payments", PaymentController.listPending);

router.put("/payments/:id/verify", PaymentController.verify);

router.put("/payments/:id/reject", PaymentController.reject);

export const PaymentRoutes = router;
