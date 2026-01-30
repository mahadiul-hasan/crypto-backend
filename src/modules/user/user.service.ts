import { prisma } from "../../configs/prisma";
import { Blockchain } from "../../generated/prisma/enums";
import { assertWalletUpdateAllowed } from "../../utils/walletUpdateLock";

const getProfile = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      isEmailVerified: true,
      profile: true,
      wallets: true,
    },
  });
};

const updateProfile = async (
  userId: string,
  payload: {
    fullName?: string;
    avatarUrl?: string;
    bio?: string;
    phone?: string;
  },
) => {
  return prisma.profile.upsert({
    where: { userId },
    update: payload,
    create: { userId, ...payload },
  });
};

const updateWallets = async (
  userId: string,
  wallets: Array<{
    chain: string;
    address: string;
    label?: string;
    networkTag?: string;
  }>,
) => {
  await assertWalletUpdateAllowed(userId);

  return prisma.$transaction([
    prisma.cryptoWallet.deleteMany({ where: { userId } }),
    prisma.cryptoWallet.createMany({
      data: wallets.map((w) => ({
        userId,
        chain: w.chain as Blockchain,
        address: w.address,
        label: w.label,
        networkTag: w.networkTag,
      })),
    }),
  ]);
};

export const UserService = {
  getProfile,
  updateProfile,
  updateWallets,
};
