import type { Request, Response, NextFunction } from 'express';
import * as service from './settings.service.js';
import { sendSuccess } from '../../../utils/response.js';

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await service.getSettings());
  } catch (e) {
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await service.updateSettings(req.body));
  } catch (e) {
    next(e);
  }
}
