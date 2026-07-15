import { Router } from 'express';
import { sendSuccess } from '../../utils/response.js';
import { paramId } from '../../utils/params.js';
import * as svc from './vendor-request.service.js';

export const vendorRequestAdminRoutes = Router();
// Note: auth is applied at the parent admin router level (SUPER_ADMIN)

// GET /admin/vendor-requests?status=PENDING&page=1
vendorRequestAdminRoutes.get('/', async (req, res, next) => {
  try {
    const r = await svc.listRequests(req.query.status as string, Number(req.query.page) || 1, Number(req.query.limit) || 20);
    sendSuccess(res, r.items, 200, { page: r.page, limit: r.limit, total: r.total });
  } catch (e) { next(e); }
});

// GET /admin/vendor-requests/pending-count
vendorRequestAdminRoutes.get('/pending-count', async (_req, res, next) => {
  try {
    sendSuccess(res, { count: await svc.getPendingCount() });
  } catch (e) { next(e); }
});

// GET /admin/vendor-requests/:id
vendorRequestAdminRoutes.get('/:id', async (req, res, next) => {
  try {
    sendSuccess(res, await svc.getRequest(paramId(req)));
  } catch (e) { next(e); }
});

// POST /admin/vendor-requests/:id/approve
vendorRequestAdminRoutes.post('/:id/approve', async (req, res, next) => {
  try {
    const result = await svc.approveRequest(paramId(req), req.user!.sub);
    sendSuccess(res, result);
  } catch (e) { next(e); }
});

// POST /admin/vendor-requests/:id/reject
vendorRequestAdminRoutes.post('/:id/reject', async (req, res, next) => {
  try {
    sendSuccess(res, await svc.rejectRequest(paramId(req), req.user!.sub, req.body.reason));
  } catch (e) { next(e); }
});

// POST /admin/vendor-requests/:id/request-info
vendorRequestAdminRoutes.post('/:id/request-info', async (req, res, next) => {
  try {
    sendSuccess(res, await svc.requestMoreInfo(paramId(req), req.user!.sub, req.body.remarks));
  } catch (e) { next(e); }
});
