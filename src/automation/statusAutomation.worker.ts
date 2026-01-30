import { Worker } from "bullmq";
import { statusUpdateQueue } from "./statusAutomation.job";
import { prisma } from "../configs/prisma";
import { redisConnection } from "../configs/redis";

const worker = new Worker(
  statusUpdateQueue.name,
  async () => {
    const now = new Date();

    // Update batch statuses
    const batches = await prisma.batch.findMany({
      where: {
        OR: [
          { status: "UPCOMING", enrollmentOpen: { lte: now } },
          { status: "ACTIVE", enrollmentClose: { lt: now } },
          { status: "UPCOMING", enrollmentClose: { lt: now } },
        ],
      },
      include: {
        course: true,
        enrollments: true,
      },
    });

    for (const batch of batches) {
      let newStatus: "UPCOMING" | "ACTIVE" | "CLOSED";

      if (now < batch.enrollmentOpen) {
        newStatus = "UPCOMING";
      } else if (now >= batch.enrollmentOpen && now <= batch.enrollmentClose) {
        newStatus = "ACTIVE";
      } else {
        newStatus = "CLOSED";
      }

      if (batch.status !== newStatus) {
        await prisma.$transaction(async (tx) => {
          await tx.batch.update({
            where: { id: batch.id },
            data: { status: newStatus },
          });

          if (newStatus === "ACTIVE") {
            for (const enrollment of batch.enrollments) {
              try {
                await tx.notification.create({
                  data: {
                    userId: enrollment.userId,
                    type: "CLASS",
                    title: `Batch "${batch.name}" is now ACTIVE`,
                    message: `Your batch "${batch.name}" for course "${batch.course.title}" has started.`,
                    dedupeKey: `batch-active-${batch.id}-${enrollment.userId}`,
                  },
                });
              } catch (e: any) {
                if (e.code === "P2002") {
                  // Duplicate notification, ignore
                } else {
                  throw e;
                }
              }
            }
          }
        });
      }
    }

    // Update course active status based on batches
    const courses = await prisma.course.findMany({
      include: {
        batches: true,
      },
    });

    for (const course of courses) {
      const hasActiveBatch = course.batches.some(
        (b) => b.status === "ACTIVE" || b.status === "UPCOMING",
      );

      if (course.isActive !== hasActiveBatch) {
        await prisma.course.update({
          where: { id: course.id },
          data: { isActive: hasActiveBatch },
        });
      }
    }
  },
  { connection: redisConnection },
);

worker.on("completed", () =>
  console.log("Batch & Course status automation completed"),
);
worker.on("failed", (job, err) =>
  console.error("Status automation job failed", err),
);

export default worker;
