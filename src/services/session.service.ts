import { redisConnection } from "../configs/redis";
import { hashRefreshToken } from "../utils/tokenHash";

const REFRESH_TTL = 30 * 24 * 60 * 60;
const MAX_DEVICES = 3;

function refreshKey(hash: string) {
  return `auth:refresh:${hash}`;
}

function userKey(userId: string) {
  return `auth:user:${userId}`;
}

export interface SessionData {
  userId: string;
  ip: string;
  ua: string;
  deviceId: string;
  createdAt: number;
  lastUsed: number;
}

/* ---------------- SAVE SESSION ---------------- */

export async function saveSession(
  userId: string,
  refreshToken: string,
  meta: {
    ip: string;
    ua: string;
    deviceId: string;
  },
) {
  const hash = hashRefreshToken(refreshToken);
  const now = Date.now();

  const existing = await redisConnection.smembers(userKey(userId));

  // Limit to 3 devices
  if (existing.length >= MAX_DEVICES) {
    await removeOldest(userId, existing);
  }

  const session: SessionData = {
    userId,
    ip: meta.ip,
    ua: meta.ua,
    deviceId: meta.deviceId,
    createdAt: now,
    lastUsed: now,
  };

  const pipe = redisConnection.pipeline();

  pipe.set(refreshKey(hash), JSON.stringify(session), "EX", REFRESH_TTL);

  pipe.sadd(userKey(userId), hash);
  pipe.expire(userKey(userId), REFRESH_TTL);

  await pipe.exec();
}

/* ---------------- DELETE ONE ---------------- */

async function deleteByHash(userId: string, hash: string) {
  const pipe = redisConnection.pipeline();

  pipe.del(refreshKey(hash));
  pipe.srem(userKey(userId), hash);

  await pipe.exec();
}

export async function invalidateSession(refreshToken: string) {
  const hash = hashRefreshToken(refreshToken);

  const raw = await redisConnection.get(refreshKey(hash));

  if (!raw) return;

  const s: SessionData = JSON.parse(raw);

  await deleteByHash(s.userId, hash);
}

/* ---------------- LOGOUT ALL ---------------- */

export async function invalidateAllSessions(userId: string) {
  const hashes = await redisConnection.smembers(userKey(userId));

  if (!hashes.length) return;

  const pipe = redisConnection.pipeline();

  for (const h of hashes) {
    pipe.del(refreshKey(h));
  }

  pipe.del(userKey(userId));

  await pipe.exec();
}

/* ---------------- LOGOUT OTHERS ---------------- */

export async function logoutOthers(userId: string, deviceId: string) {
  const hashes = await redisConnection.smembers(userKey(userId));

  for (const h of hashes) {
    const raw = await redisConnection.get(refreshKey(h));

    if (!raw) continue;

    const s: SessionData = JSON.parse(raw);

    if (s.deviceId !== deviceId) {
      await deleteByHash(userId, h);
    }
  }
}

/* ---------------- OPTIMIZED LIST SESSIONS ---------------- */
export async function listSessions(userId: string) {
  const hashes = await redisConnection.smembers(userKey(userId));
  if (hashes.length === 0) return [];

  // Fetch all sessions in one network round-trip
  const keys = hashes.map((h) => refreshKey(h));
  const results = await redisConnection.mget(...keys);

  // Filter out nulls (expired sessions) and parse
  return results
    .filter((raw): raw is string => raw !== null)
    .map((raw) => JSON.parse(raw) as SessionData);
}

/* ---------------- OPTIMIZED REMOVE OLDEST ---------------- */
async function removeOldest(userId: string, hashes: string[]) {
  // Guard against empty arrays (mget can fail if passed no keys)
  if (hashes.length === 0) return;

  const keys = hashes.map((h) => refreshKey(h));
  const results = await redisConnection.mget(...keys);

  // Explicitly type the variable
  let oldest: { hash: string; time: number } | null = null;

  // Using a standard loop is much better for TypeScript's type tracking
  for (let i = 0; i < results.length; i++) {
    const raw = results[i];
    if (!raw) continue;

    const s: SessionData = JSON.parse(raw);

    if (!oldest || s.createdAt < oldest.time) {
      oldest = { hash: hashes[i], time: s.createdAt };
    }
  }

  // TypeScript now correctly identifies 'oldest' as { hash: string; time: number }
  if (oldest) {
    await deleteByHash(userId, oldest.hash);
  }
}
