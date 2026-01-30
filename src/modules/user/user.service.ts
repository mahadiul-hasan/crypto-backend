import { prisma } from "../../configs/prisma";
import { Blockchain } from "../../generated/prisma/enums";
import {
  cacheGetOrSet,
  cacheInvalidate,
  makeCacheKey,
} from "../../utils/cache";
import { assertWalletUpdateAllowed } from "../../utils/walletUpdateLock";

const getProfile = async (userId: string) => {
  const key = makeCacheKey("user:profile", userId);

  return cacheGetOrSet(key, () =>
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isEmailVerified: true,
        profile: true,
        wallets: true,
      },
    }),
  );
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
  const result = await prisma.profile.upsert({
    where: { userId },
    update: payload,
    create: { userId, ...payload },
  });

  await cacheInvalidate(`user:profile:${userId}`);

  return result;
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

  const result = await prisma.$transaction([
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

  await cacheInvalidate(`user:profile:${userId}`);

  return result;
};

export const UserService = {
  getProfile,
  updateProfile,
  updateWallets,
};
