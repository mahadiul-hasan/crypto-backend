import { Queue } from "bullmq";
import { redisConnection } from "../configs/redis";

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
}

export const EMAIL_QUEUE_NAME = "email-queue";

export const emailQueue = new Queue<EmailJobData>(EMAIL_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 3000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
