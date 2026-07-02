import type { Response } from 'express';
import type { ApiMeta, ApiResponse } from '../types/index.js';

export function sendSuccess<T>(
  res: Response,
  data: T,
  status = 200,
  meta?: ApiMeta,
): void {
  const body: ApiResponse<T> = { success: true, data, error: null, meta };
  res.status(status).json(body);
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  status = 400,
  details?: Record<string, unknown>,
): void {
  const body: ApiResponse = {
    success: false,
    data: null,
    error: { code, message, details },
  };
  res.status(status).json(body);
}
