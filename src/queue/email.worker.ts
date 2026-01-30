import { Worker } from "bullmq";
import { EMAIL_QUEUE_NAME, EmailJobData } from "./email.queue.js";
import { redisConnection } from "../configs/redis.js";
import { sendEmail } from "../utils/mailer.js";

export const emailWorker = new Worker<EmailJobData>(
  EMAIL_QUEUE_NAME,
  async (job) => {
    const { to, subject, html } = job.data;
    await sendEmail(to, subject, html);
  },
  {
    connection: redisConnection,
    concurrency: 10,
  },
);

emailWorker.on("failed", (job, err) => {
  console.error(`[EMAIL_QUEUE_FAILED] Job ${job?.id}`, err);
});
