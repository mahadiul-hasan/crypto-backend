import { Role } from "../generated/prisma/client";

export type RegisterData = {
  name: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
  verificationCodeSent: boolean;
};

export type RegisterEnevtPayload = {
  email: string;
  name: string;
  verificationCode: string;
};

export type VerifyEnevtPayload = {
  email: string;
  name: string;
  resetLink: string;
};
