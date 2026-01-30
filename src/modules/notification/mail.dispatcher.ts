import { emailQueue } from "../../queue/email.queue";
import { emailTemplates } from "../../templates/emailTemplates";

type MailType =
  | "AUTH_VERIFY"
  | "AUTH_RESEND_VERIFY"
  | "AUTH_RESET_PASSWORD"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "PAYMENT_SUBMITTED_ADMIN";

interface SendMailOptions {
  type: MailType;
  to: string;
  data: any;
  dedupeKey: string;
}

export const MailDispatcher = {
  async send({ type, to, data, dedupeKey }: SendMailOptions) {
    let subject = "";
    let html = "";

    switch (type) {
      case "AUTH_VERIFY":
        subject = "Verify your email";
        html = emailTemplates.verification(data.name, data.verificationCode);
        break;

      case "AUTH_RESEND_VERIFY":
        subject = "Verify your email";
        html = emailTemplates.verification(data.name, data.verificationCode);
        break;

      case "AUTH_RESET_PASSWORD":
        subject = "Reset Your Password";
        html = emailTemplates.passwordReset(data.name, data.resetLink);
        break;

      case "PAYMENT_SUBMITTED_ADMIN":
        subject = "New Payment Submitted";
        html = emailTemplates.adminPaymentSubmitted(
          data.userName,
          data.userEmail,
          data.amount,
          data.courseName,
          data.paymentId,
        );
        break;

      case "PAYMENT_SUCCESS":
        subject = "Payment Successful";
        html = emailTemplates.paymentSuccess(
          data.name,
          data.amount,
          data.courseName,
          data.transactionId,
        );
        break;

      case "PAYMENT_FAILED":
        subject = "Payment Failed";
        html = emailTemplates.paymentFailed(
          data.name,
          data.amount,
          data.courseName,
          data.reason,
        );
        break;
    }

    return emailQueue.add(
      type,
      {
        to,
        subject,
        html,
      },
      {
        jobId: dedupeKey, // idempotency
        removeOnComplete: true,
        attempts: 3,
      },
    );
  },
};
