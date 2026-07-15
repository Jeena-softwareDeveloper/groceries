import { Router } from 'express';
import { sendSuccess } from '../../../utils/response.js';
import { paramId } from '../../../utils/params.js';
import * as svc from '../../vendor/vendor.service.js';
import type { Request, Response, NextFunction } from 'express';

export const productApprovalAdminRoutes = Router();

productApprovalAdminRoutes.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const r = await svc.listProductApprovals(
      req.query.status as string | undefined,
      Number(req.query.page) || 1,
      Number(req.query.limit) || 20,
    );
    sendSuccess(res, r.items, 200, { page: r.page, limit: r.limit, total: r.total });
  } catch (e) { next(e); }
});

productApprovalAdminRoutes.post('/:id/approve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    sendSuccess(res, await svc.approveProductApproval(paramId(req), req.user!.sub));
  } catch (e) { next(e); }
});

productApprovalAdminRoutes.post('/:id/reject', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reason } = req.body;
    sendSuccess(res, await svc.rejectProductApproval(paramId(req), req.user!.sub, reason ?? 'Not approved'));
  } catch (e) { next(e); }
});

productApprovalAdminRoutes.post('/:id/request-changes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { notes } = req.body;
    sendSuccess(res, await svc.requestProductChanges(paramId(req), req.user!.sub, notes ?? ''));
  } catch (e) { next(e); }
});

// ─── Offer Approvals ──────────────────────────────────────────────────────────
export const offerApprovalAdminRoutes = Router();

offerApprovalAdminRoutes.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const r = await svc.listPendingOffers(Number(req.query.page) || 1, Number(req.query.limit) || 20);
    sendSuccess(res, r.items, 200, { page: r.page, limit: r.limit, total: r.total });
  } catch (e) { next(e); }
});

offerApprovalAdminRoutes.post('/:id/approve', async (req: Request, res: Response, next: NextFunction) => {
  try { sendSuccess(res, await svc.approveOffer(paramId(req))); } catch (e) { next(e); }
});

offerApprovalAdminRoutes.post('/:id/reject', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reason } = req.body;
    sendSuccess(res, await svc.rejectOffer(paramId(req), reason ?? 'Not approved'));
  } catch (e) { next(e); }
});
