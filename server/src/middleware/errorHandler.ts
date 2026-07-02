import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../lib/logger.js';
import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    sendError(res, err.code, err.message, err.statusCode, err.details);
    return;
  }

  if (err instanceof ZodError) {
    sendError(res, 'VALIDATION_ERROR', 'Validation failed', 422, {
      fields: err.flatten().fieldErrors,
    });
    return;
  }

  logger.error({ err }, 'Unhandled error');
  sendError(res, 'INTERNAL_ERROR', 'Internal server error', 500);
}
