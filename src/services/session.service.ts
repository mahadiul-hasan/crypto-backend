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

/* ---------------- REMOVE OLDEST ---------------- */

async function removeOldest(userId: string, hashes: string[]) {
  let oldest: { hash: string; time: number } | null = null;

  for (const h of hashes) {
    const raw = await redisConnection.get(refreshKey(h));

    if (!raw) continue;

    const s: SessionData = JSON.parse(raw);

    if (!oldest || s.createdAt < oldest.time) {
      oldest = { hash: h, time: s.createdAt };
    }
  }

  if (oldest) {
    await deleteByHash(userId, oldest.hash);
  }
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

/* ---------------- LIST SESSIONS ---------------- */

export async function listSessions(userId: string) {
  const hashes = await redisConnection.smembers(userKey(userId));

  const out: SessionData[] = [];

  for (const h of hashes) {
    const raw = await redisConnection.get(refreshKey(h));

    if (raw) {
      out.push(JSON.parse(raw));
    }
  }

  return out;
}
