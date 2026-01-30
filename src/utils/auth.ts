import { prisma } from "../configs/prisma";
import { Role } from "../generated/prisma/client";
import crypto from "crypto";

export const determineUserRole = (email: string): Role => {
  if (email === "mahadiul09@gmail.com") {
    return Role.SUPER_ADMIN;
  }

  return Role.USER;
};

export const generateVerificationCode = (): string => {
  const code = crypto.randomInt(100000, 999999).toString();
  return code;
};

export const invalidateOldCodes = async (userId: string) => {
  await prisma.emailVerificationCode.updateMany({
    where: {
      userId,
      used: false,
    },
    data: {
      used: true,
    },
  });
};
