import { redisConnection } from "../configs/redis";

const REFRESH_EXPIRES_SEC = 60 * 60 * 24 * 30;

export async function saveSession(userId: string, tokenId: string) {
  await redisConnection
    .multi()
    .set(`auth:refresh:${tokenId}`, userId, "EX", REFRESH_EXPIRES_SEC)
    .sadd(`auth:user:sessions:${userId}`, tokenId)
    .exec();
}

export async function invalidateSession(tokenId: string) {
  const userId = await redisConnection.get(`auth:refresh:${tokenId}`);
  if (!userId) return;

  await redisConnection
    .multi()
    .del(`auth:refresh:${tokenId}`)
    .srem(`auth:user:sessions:${userId}`, tokenId)
    .exec();
}

export async function invalidateAllSessions(userId: string) {
  const tokens = await redisConnection.smembers(`auth:user:sessions:${userId}`);

  const tx = redisConnection.multi();
  tokens.forEach((t) => tx.del(`auth:refresh:${t}`));
  tx.del(`auth:user:sessions:${userId}`);
  await tx.exec();
}
