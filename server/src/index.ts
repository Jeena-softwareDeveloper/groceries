import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './lib/prisma.js';
import { connectRedis, disconnectRedis } from './lib/redis.js';
import { logger } from './lib/logger.js';

async function bootstrap() {
  const dbOk = await connectDatabase();
  const redisOk = await connectRedis();

  if (!dbOk) logger.warn('Database connection failed — health will report degraded');
  if (!redisOk) logger.warn('Redis connection failed — caching and rate limits use memory fallback');

  const app = createApp();

  app.listen(env.PORT, () => {
    logger.info(`DistrictMart API → http://localhost:${env.PORT}`);
    logger.info(`Swagger docs → http://localhost:${env.PORT}/api/docs`);
  });

  const shutdown = async () => {
    await disconnectDatabase();
    await disconnectRedis();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((err) => {
  logger.error(err);
  process.exit(1);
});
