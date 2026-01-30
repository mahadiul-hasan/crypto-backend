import { EventEmitter } from "events";
import { MailDispatcher } from "../notification/mail.dispatcher";

export const paymentEventEmitter = new EventEmitter();

paymentEventEmitter.on(
  "payment.submitted",
  async ({ userName, userEmail, amount, courseName, paymentId }) => {
    await MailDispatcher.send({
      type: "PAYMENT_SUBMITTED_ADMIN",
      to: process.env.ADMIN_EMAIL!,
      data: {
        userName,
        userEmail,
        amount,
        courseName,
        paymentId,
      },
      dedupeKey: `pay:submit:${paymentId}`,
    });
  },
);

paymentEventEmitter.on(
  "payment.verified",
  async ({ email, name, amount, courseName, transactionId, userId }) => {
    await MailDispatcher.send({
      type: "PAYMENT_SUCCESS",
      to: email,
      data: {
        name,
        amount,
        courseName,
        transactionId,
      },
      dedupeKey: `pay:success:${userId}:${transactionId}`,
    });
  },
);

paymentEventEmitter.on(
  "payment.rejected",
  async ({ email, name, amount, courseName, reason, userId }) => {
    await MailDispatcher.send({
      type: "PAYMENT_FAILED",
      to: email,
      data: {
        name,
        amount,
        courseName,
        reason,
      },
      dedupeKey: `pay:fail:${userId}:${Date.now()}`,
    });
  },
);
