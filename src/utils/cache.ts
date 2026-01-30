import { redisConnection } from "../configs/redis";

type CacheOptions = {
  ttlSeconds?: number; // optional expiration
};

export const cacheGetOrSet = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  options?: CacheOptions,
): Promise<T> => {
  const cached = await redisConnection.get(key);
  if (cached) {
    return JSON.parse(cached) as T;
  }

  const data = await fetchFn();
  if (data !== undefined && data !== null) {
    if (options?.ttlSeconds) {
      await redisConnection.setex(
        key,
        options.ttlSeconds,
        JSON.stringify(data),
      );
    } else {
      await redisConnection.set(key, JSON.stringify(data));
    }
  }

  return data;
};

export const cacheInvalidate = async (patterns: string | string[]) => {
  const patternList = Array.isArray(patterns) ? patterns : [patterns];
  for (const pattern of patternList) {
    // Scan keys matching pattern and delete
    const stream = redisConnection.scanStream({ match: pattern });
    const keysToDelete: string[] = [];
    for await (const keys of stream) {
      if (keys.length) keysToDelete.push(...keys);
    }
    if (keysToDelete.length) {
      await redisConnection.del(...keysToDelete);
    }
  }
};

export const makeCacheKey = (namespace: string, identifier: string) =>
  `${namespace}:${identifier}`;
