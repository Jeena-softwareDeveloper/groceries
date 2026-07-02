import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { paramId } from '../../../utils/params.js';
import * as service from './vendor.service.js';
import { sendSuccess } from '../../../utils/response.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const status = req.query.status as string | undefined;
    const result = await service.listVendors(status, page, limit);
    sendSuccess(res, result.items, 200, { page: result.page, limit: result.limit, total: result.total });
  } catch (e) {
    next(e);
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await service.getVendor(paramId(req)));
  } catch (e) {
    next(e);
  }
}

export async function approve(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await service.approveVendor(paramId(req), req.user!.sub));
  } catch (e) {
    next(e);
  }
}

export async function reject(req: Request, res: Response, next: NextFunction) {
  try {
    const { reason } = z.object({ reason: z.string().min(3) }).parse(req.body);
    sendSuccess(res, await service.rejectVendor(paramId(req), reason));
  } catch (e) {
    next(e);
  }
}

export async function suspend(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await service.suspendVendor(paramId(req)));
  } catch (e) {
    next(e);
  }
}
