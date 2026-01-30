import { Worker } from "bullmq";
import { classReminderQueue } from "./sendClassReminder.job";
import { prisma } from "../configs/prisma";
import { redisConnection } from "../configs/redis";

const worker = new Worker(
  classReminderQueue.name,
  async () => {
    const now = new Date();
    const reminderWindowStart = now;
    const reminderWindowEnd = new Date(now.getTime() + 60 * 60 * 1000); // next 1 hour

    // Find classes starting in the next hour
    const upcomingClasses = await prisma.class.findMany({
      where: {
        date: {
          gte: reminderWindowStart,
          lte: reminderWindowEnd,
        },
      },
      include: {
        batch: {
          include: {
            enrollments: true,
            course: true,
          },
        },
      },
    });

    for (const cls of upcomingClasses) {
      for (const enrollment of cls.batch.enrollments) {
        try {
          await prisma.notification.create({
            data: {
              userId: enrollment.userId,
              type: "CLASS",
              title: `Upcoming Class Reminder: ${cls.title}`,
              message: `Your class "${cls.title}" in batch "${cls.batch.name}" for course "${cls.batch.course.title}" starts soon.`,
              dedupeKey: `class-reminder-${cls.id}-${enrollment.userId}`,
            },
          });
        } catch (e: any) {
          if (e.code === "P2002") {
            // Duplicate notification, skip
          } else {
            throw e;
          }
        }
      }
    }
  },
  { connection: redisConnection },
);

worker.on("completed", () => console.log("Class reminder job completed"));
worker.on("failed", (job, err) =>
  console.error("Class reminder job failed", err),
);

export default worker;
