import type { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import { getRedis } from '../../lib/redis.js';
import { sendSuccess } from '../../utils/response.js';
import type { HealthStatus } from '../../types/index.js';

export async function getHealth(_req: Request, res: Response): Promise<void> {
  let dbStatus: HealthStatus['services']['database'] = 'unknown';
  let redisStatus: HealthStatus['services']['redis'] = 'unknown';

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'up';
  } catch {
    dbStatus = 'down';
  }

  const redis = getRedis();
  if (redis) {
    try {
      await redis.ping();
      redisStatus = 'up';
    } catch {
      redisStatus = 'down';
    }
  } else {
    redisStatus = 'down';
  }

  const overall =
    dbStatus === 'up' && redisStatus === 'up'
      ? 'ok'
      : dbStatus === 'down' && redisStatus === 'down'
        ? 'down'
        : 'degraded';

  const health: HealthStatus = {
    status: overall,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '0.1.0',
    services: { database: dbStatus, redis: redisStatus },
  };

  sendSuccess(res, health);
}
