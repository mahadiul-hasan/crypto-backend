import { EventEmitter } from "events";
import { MailDispatcher } from "../notification/mail.dispatcher";
import { RegisterEnevtPayload, VerifyEnevtPayload } from "../../types/auth";

export const authEventEmitter = new EventEmitter();

authEventEmitter.on(
  "auth.user.registered",
  async ({ email, name, verificationCode }: RegisterEnevtPayload) => {
    await MailDispatcher.send({
      type: "AUTH_VERIFY",
      to: email,
      data: { name, verificationCode },
      dedupeKey: `auth:verify:${email}`,
    });
  },
);

authEventEmitter.on(
  "auth.user.resend.verification",
  async ({ email, name, verificationCode }: RegisterEnevtPayload) => {
    await MailDispatcher.send({
      type: "AUTH_RESEND_VERIFY",
      to: email,
      data: { name, verificationCode },
      dedupeKey: `auth:resend:${email}`,
    });
  },
);

authEventEmitter.on(
  "auth.user.password.reset.request",
  async ({ email, name, resetLink }: VerifyEnevtPayload) => {
    await MailDispatcher.send({
      type: "AUTH_RESET_PASSWORD",
      to: email,
      data: { name, resetLink },
      dedupeKey: `auth:reset:${email}`,
    });
  },
);
