import { prisma } from "../../configs/prisma";
import { Errors } from "../../utils/errorHelpers";
import { paymentEventEmitter } from "./payment.events";
import {
  cacheGetOrSet,
  cacheInvalidate,
  makeCacheKey,
} from "../../utils/cache";

// Helper: Invalidate payment-related caches, plus user classes/enrollments
const invalidatePaymentCaches = async (userId: string) => {
  await cacheInvalidate([
    `user:payments:${userId}*`,
    `payments:pending*`,
    `user:batches:${userId}`, // In case enrollments change on verification
    `user:classes:${userId}`, // User's classes cache must also be invalidated on enrollment
  ]);
};

const submitPayment = async (userId: string, data: any) => {
  const { batchId, senderNumber, transactionId, method } = data;

  // 2. Load user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw Errors.NotFound("User not found");

  // 3. Load batch + course
  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: { course: true },
  });

  if (!batch) throw Errors.NotFound("Batch not found");
  if (!batch.course) throw Errors.NotFound("Course not found for this batch");

  if (batch.status !== "UPCOMING") {
    throw Errors.BadRequest("Batch not open for enrollment");
  }

  const now = new Date();
  if (now < batch.enrollmentOpen || now > batch.enrollmentClose) {
    throw Errors.BadRequest("Enrollment window closed");
  }

  if (!batch.course.isActive) {
    throw Errors.BadRequest("Course is inactive");
  }

  // Prevent duplicate enrollment
  const enrolled = await prisma.enrollment.findUnique({
    where: { userId_batchId: { userId, batchId } },
  });

  if (enrolled) throw Errors.Conflict("Already enrolled");

  // Prevent duplicate or pending payment
  const existing = await prisma.payment.findFirst({
    where: {
      OR: [{ transactionId }, { userId, batchId, status: "PENDING" }],
    },
  });

  if (existing) throw Errors.Conflict("Payment already submitted");

  const amount = batch.course.price;

  const payment = await prisma.payment.create({
    data: { userId, batchId, senderNumber, transactionId, method, amount },
  });

  // Invalidate user payments cache after new payment
  await invalidatePaymentCaches(userId);

  paymentEventEmitter.emit("payment.submitted", {
    userName: user.name,
    userEmail: user.email,
    amount: batch.course.price,
    courseName: batch.course.title,
    paymentId: payment.id,
  });

  return payment;
};

type ListUserPaymentsParams = {
  userId: string;
  page: number;
  pageSize: number;
  search?: string;
};

const getUserPayments = async ({
  userId,
  page,
  pageSize,
  search,
}: ListUserPaymentsParams) => {
  const key = makeCacheKey(
    "user:payments",
    `${userId}:${page}:${pageSize}:${search ?? ""}`,
  );

  return cacheGetOrSet(key, async () => {
    const where: any = { userId };

    if (search) {
      where.OR = [
        { transactionId: { contains: search, mode: "insensitive" } },
        { method: { contains: search, mode: "insensitive" } },
        {
          batch: {
            course: { title: { contains: search, mode: "insensitive" } },
          },
        },
      ];
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          batch: { include: { course: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.count({ where }),
    ]);

    return { data: payments, total, page, pageSize };
  });
};

const listPendingPayments = async () => {
  const key = "payments:pending";

  return cacheGetOrSet(key, () =>
    prisma.payment.findMany({
      where: { status: "PENDING" },
      include: {
        user: true,
        batch: { include: { course: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
  );
};

const verifyPayment = async (paymentId: string) => {
  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: true,
        batch: { include: { course: true } },
      },
    });

    if (!payment) throw Errors.NotFound("Payment not found");
    if (!payment.user) throw Errors.NotFound("User not found for this payment");
    if (!payment.batch || !payment.batch.course)
      throw Errors.NotFound("Course not found for this payment");

    if (payment.status !== "PENDING")
      throw Errors.BadRequest("Payment already processed");

    const updated = await tx.payment.update({
      where: { id: paymentId },
      data: { status: "VERIFIED" },
    });

    await tx.enrollment.create({
      data: { userId: payment.userId, batchId: payment.batchId },
    });

    await tx.notification.create({
      data: {
        userId: payment.userId,
        type: "PAYMENT",
        title: "Payment Verified",
        message: `You are enrolled in ${payment.batch.course.title}`,
        dedupeKey: `payment:verified:${paymentId}`,
      },
    });

    return {
      user: payment.user,
      course: payment.batch.course,
      payment: updated,
    };
  });

  await invalidatePaymentCaches(result.user.id);

  paymentEventEmitter.emit("payment.verified", {
    userId: result.user.id,
    email: result.user.email,
    name: result.user.name,
    amount: result.course.price,
    courseName: result.course.title,
    transactionId: result.payment.transactionId,
  });

  return result;
};

const rejectPayment = async (
  paymentId: string,
  reason = "Invalid payment information",
) => {
  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: true,
        batch: { include: { course: true } },
      },
    });

    if (!payment) throw Errors.NotFound("Payment not found");
    if (!payment.user) throw Errors.NotFound("User not found for this payment");
    if (!payment.batch || !payment.batch.course)
      throw Errors.NotFound("Course not found for this payment");

    if (payment.status !== "PENDING")
      throw Errors.BadRequest("Payment already processed");

    const updated = await tx.payment.update({
      where: { id: paymentId },
      data: { status: "REJECTED" },
    });

    await tx.notification.create({
      data: {
        userId: payment.userId,
        type: "PAYMENT",
        title: "Payment Rejected",
        message: reason,
        dedupeKey: `payment:rejected:${paymentId}`,
      },
    });

    return {
      user: payment.user,
      course: payment.batch.course,
      payment: updated,
      reason,
    };
  });

  await invalidatePaymentCaches(result.user.id);

  paymentEventEmitter.emit("payment.rejected", {
    userId: result.user.id,
    email: result.user.email,
    name: result.user.name,
    amount: result.course.price,
    courseName: result.course.title,
    reason: result.reason,
  });

  return result;
};

export const PaymentService = {
  submitPayment,
  getUserPayments,
  listPendingPayments,
  verifyPayment,
  rejectPayment,
};
