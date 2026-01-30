import { redisConnection } from "../configs/redis";

const WEEK_SECONDS = 60 * 60 * 24 * 7;

export async function assertWalletUpdateAllowed(userId: string) {
  const key = `user:wallet:update:lock:${userId}`;

  const exists = await redisConnection.exists(key);
  if (exists) {
    throw new Error("Wallets can only be updated once per week");
  }

  await redisConnection.set(key, "1", "EX", WEEK_SECONDS);
}
