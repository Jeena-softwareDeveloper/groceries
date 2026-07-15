import { Redis } from 'ioredis';
import { env } from '../config/env.js';
import { logger } from './logger.js';

let redis: Redis | null = null;

export function getRedis(): Redis | null {
  return redis;
}

export async function connectRedis(): Promise<boolean> {
  try {
    const client = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      retryStrategy: () => null,
      enableOfflineQueue: false,
    });
    client.on('error', (err: Error) => logger.debug({ err }, 'Redis error'));
    await client.connect();
    await client.ping();
    redis = client;
    return true;
  } catch {
    redis = null;
    return false;
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit().catch(() => {});
    redis = null;
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const val = await redis.get(key);
    return val ? (JSON.parse(val) as T) : null;
  } catch { return null; }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
  if (!redis) return;
  try { await redis.setex(key, ttlSeconds, JSON.stringify(value)); } catch { /* noop */ }
}

export async function cacheDel(...keys: string[]): Promise<void> {
  if (!redis || keys.length === 0) return;
  try { await redis.del(...keys); } catch { /* noop */ }
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  if (!redis) return;
  try {
    const stream = redis.scanStream({ match: pattern, count: 100 });
    for await (const keys of stream) {
      if (keys.length) await redis.del(...keys);
    }
  } catch { /* noop */ }
}
