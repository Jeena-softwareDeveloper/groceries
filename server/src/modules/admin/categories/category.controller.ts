import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../lib/prisma.js';
import { paramId } from '../../../utils/params.js';
import * as service from './category.service.js';
import { sendSuccess } from '../../../utils/response.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const isSubcategory = req.baseUrl.includes('subcategories');
    if (isSubcategory) {
      const parentId = req.query.parentId as string | undefined;
      const items = parentId
        ? await service.listCategories(parentId)
        : await prisma.category.findMany({
            where: { parentId: { not: null } },
            orderBy: { sortOrder: 'asc' },
            include: { parent: { select: { id: true, name: true } } },
          });
      sendSuccess(res, items);
      return;
    }
    sendSuccess(res, await service.listCategories(null));
  } catch (e) {
    next(e);
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await service.getCategory(paramId(req)));
  } catch (e) {
    next(e);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const isSubcategory = req.baseUrl.includes('subcategories');
    const body = isSubcategory && !req.body.parentId
      ? { ...req.body, parentId: req.query.parentId }
      : req.body;
    sendSuccess(res, await service.createCategory(body), 201);
  } catch (e) {
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await service.updateCategory(paramId(req), req.body));
  } catch (e) {
    next(e);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await service.deleteCategory(paramId(req));
    sendSuccess(res, { deleted: true });
  } catch (e) {
    next(e);
  }
}
