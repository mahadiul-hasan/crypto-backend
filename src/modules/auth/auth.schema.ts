import { z } from "zod";

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(6),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string(),
  }),
});

const verifyEmailSchema = z.object({
  body: z.object({
    email: z.email(),
    code: z.string().length(6),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
  }),
});

export const AuthSchema = {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  changePasswordSchema,
};
