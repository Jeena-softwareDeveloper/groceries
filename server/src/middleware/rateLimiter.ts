import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedis } from '../lib/redis.js';

function createStore(prefix: string) {
  const redis = getRedis();
  if (!redis) return undefined;
  return new RedisStore({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendCommand: (...args: string[]) => redis.call(args[0], ...args.slice(1)) as any,
    prefix: `rl:${prefix}:`,
  });
}

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('global'),
  message: { success: false, data: null, error: { code: 'RATE_LIMIT', message: 'Too many requests' } },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('auth'),
  message: { success: false, data: null, error: { code: 'RATE_LIMIT', message: 'Too many auth attempts' } },
});

export const otpRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('otp'),
  message: { success: false, data: null, error: { code: 'RATE_LIMIT', message: 'Too many OTP requests' } },
});
