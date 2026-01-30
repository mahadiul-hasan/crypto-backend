import nodemailer from "nodemailer";
import { env } from "../configs/env";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

/**
 * Send email (used by queues only)
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  await transporter.sendMail({
    from: `"Crypto Academy" <${env.ADMIN_EMAIL}>`,
    to,
    subject,
    html,
  });
}
