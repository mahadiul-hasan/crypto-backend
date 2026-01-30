import { Queue } from "bullmq";
import { redisConnection } from "../configs/redis";

const CLASS_REMINDER_QUEUE = "class-reminder-queue";

export const classReminderQueue = new Queue(CLASS_REMINDER_QUEUE, {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: true,
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
  },
});

export async function scheduleClassReminders() {
  await classReminderQueue.add(
    "send-class-reminders",
    {},
    { repeat: { pattern: "*/10 * * * *" } },
  );
}
