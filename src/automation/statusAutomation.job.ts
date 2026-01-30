import { Queue } from "bullmq";
import { redisConnection } from "../configs/redis";

const STATUS_UPDATE_QUEUE = "status-update-queue";

export const statusUpdateQueue = new Queue(STATUS_UPDATE_QUEUE, {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: true,
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
  },
});

// Schedule this job every 5 mins in your app bootstrap or via cron integration
export async function scheduleStatusUpdate() {
  await statusUpdateQueue.add(
    "update-status",
    {},
    { repeat: { pattern: "*/5 * * * *" } },
  );
}
