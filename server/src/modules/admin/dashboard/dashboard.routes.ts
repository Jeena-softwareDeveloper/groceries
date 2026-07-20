import { Router } from 'express';
import { sendSuccess } from '../../../utils/response.js';
import { getDashboardMetrics } from './dashboard.service.js';
import type { Request, Response, NextFunction } from 'express';

export const dashboardRoutes = Router();

dashboardRoutes.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getDashboardMetrics();
    sendSuccess(res, data);
  } catch (e) {
    next(e);
  }
});
