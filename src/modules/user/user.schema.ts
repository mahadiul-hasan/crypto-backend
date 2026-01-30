import { z } from "zod";

const updateProfile = z.object({
  body: z.object({
    fullName: z.string().optional(),
    avatarUrl: z.string().url().optional(),
    bio: z.string().max(500).optional(),
    phone: z.string().min(7).max(15).optional(),
  }),
});

const updateWallets = z.object({
  body: z.object({
    wallets: z
      .array(
        z.object({
          chain: z.enum(["BTC", "ETH", "BSC", "SOL", "TRON", "ARBITRUM"]),
          address: z.string().min(10),
          label: z.string().optional(),
          networkTag: z.string().optional(),
        }),
      )
      .min(1),
  }),
});

export const UserSchema = {
  updateProfile,
  updateWallets,
};
