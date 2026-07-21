import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { globalRateLimiter } from './middleware/rateLimiter.js';
import { healthRoutes } from './modules/health/health.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { uploadRoutes } from './modules/upload/upload.routes.js';
import { adminRoutes } from './modules/admin/admin.routes.js';
import { vendorRoutes } from './modules/vendor/vendor.routes.js';
import { customerRoutes } from './modules/customer/customer.routes.js';
import { sendError } from './utils/response.js';
import { swaggerSpec } from './docs/swagger.js';

export function createApp() {
  const app = express();
  const allowedOrigins = env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean);

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
          return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(requestLogger);
  app.use(globalRateLimiter);

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use('/api/v1/health', healthRoutes);
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/upload', uploadRoutes);
  app.use('/api/v1/admin', adminRoutes);
  app.use('/api/v1/vendor', vendorRoutes);
  app.use('/api/v1/customer', customerRoutes);

  app.use((_req, res) => {
    sendError(res, 'NOT_FOUND', 'Route not found', 404);
  });

  app.use(errorHandler);
  return app;
}
