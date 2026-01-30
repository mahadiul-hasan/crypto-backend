import { redisConnection } from "../configs/redis";

const MAX_PER_HOUR = 3;
const COOLDOWN_SECONDS = 60;

export async function checkEmailRateLimit(userId: string) {
  const cooldownKey = `email:verify:cooldown:${userId}`;
  const countKey = `email:verify:count:${userId}`;

  const [cooldownExists, count] = await Promise.all([
    redisConnection.exists(cooldownKey),
    redisConnection.get(countKey),
  ]);

  if (cooldownExists) {
    throw new Error("Please wait before requesting another code");
  }

  if (count && Number(count) >= MAX_PER_HOUR) {
    throw new Error("Verification email limit reached. Try again later.");
  }

  // increment count
  const tx = redisConnection.multi();
  tx.incr(countKey);
  tx.expire(countKey, 60 * 60); // 1 hour
  tx.set(cooldownKey, "1", "EX", COOLDOWN_SECONDS);

  await tx.exec();
}
