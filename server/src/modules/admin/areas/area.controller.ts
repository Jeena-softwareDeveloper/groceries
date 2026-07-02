import type { Request, Response, NextFunction } from 'express';
import { paramId } from '../../../utils/params.js';
import * as service from './area.service.js';
import { sendSuccess } from '../../../utils/response.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const districtId = req.query.districtId as string | undefined;
    const result = await service.listAreas(districtId, page, limit);
    sendSuccess(res, result.items, 200, { page: result.page, limit: result.limit, total: result.total });
  } catch (e) {
    next(e);
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await service.getArea(paramId(req)));
  } catch (e) {
    next(e);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await service.createArea(req.body), 201);
  } catch (e) {
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await service.updateArea(paramId(req), req.body));
  } catch (e) {
    next(e);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await service.deleteArea(paramId(req));
    sendSuccess(res, { deleted: true });
  } catch (e) {
    next(e);
  }
}
