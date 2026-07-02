import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth.service.js';
import { sendSuccess } from '../../utils/response.js';
import { paramId } from '../../utils/params.js';
import * as svc from './vendor.service.js';

export const vendorRoutes = Router();
vendorRoutes.use(authenticate, authorize('VENDOR'));

vendorRoutes.get('/categories', async (_req, res, next) => {
  try {
    sendSuccess(res, await import('../../lib/prisma.js').then(({ prisma }) =>
      prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' }, select: { id: true, name: true, slug: true } }),
    ));
  } catch (e) { next(e); }
});
vendorRoutes.get('/profile', async (req, res, next) => {
  try { sendSuccess(res, await svc.getVendorProfile(req.user!.sub)); } catch (e) { next(e); }
});
vendorRoutes.put('/profile', async (req, res, next) => {
  try { sendSuccess(res, await svc.updateVendorProfile(req.user!.sub, req.body)); } catch (e) { next(e); }
});
vendorRoutes.get('/products', async (req, res, next) => {
  try {
    const r = await svc.listVendorProducts(req.user!.sub, Number(req.query.page) || 1, Number(req.query.limit) || 20);
    sendSuccess(res, r.items, 200, { page: r.page, limit: r.limit, total: r.total });
  } catch (e) { next(e); }
});
vendorRoutes.post('/products', async (req, res, next) => {
  try { sendSuccess(res, await svc.createProduct(req.user!.sub, req.body), 201); } catch (e) { next(e); }
});
vendorRoutes.put('/products/:id', async (req, res, next) => {
  try { sendSuccess(res, await svc.updateProduct(req.user!.sub, paramId(req), req.body)); } catch (e) { next(e); }
});
vendorRoutes.post('/products/:id/publish', async (req, res, next) => {
  try { sendSuccess(res, await svc.publishProduct(req.user!.sub, paramId(req), 'PUBLISHED')); } catch (e) { next(e); }
});
vendorRoutes.post('/products/:id/unpublish', async (req, res, next) => {
  try { sendSuccess(res, await svc.publishProduct(req.user!.sub, paramId(req), 'UNPUBLISHED')); } catch (e) { next(e); }
});
vendorRoutes.delete('/products/:id', async (req, res, next) => {
  try { await svc.deleteProduct(req.user!.sub, paramId(req)); sendSuccess(res, { deleted: true }); } catch (e) { next(e); }
});
vendorRoutes.put('/inventory/:productId', async (req, res, next) => {
  try { sendSuccess(res, await svc.updateInventory(req.user!.sub, paramId(req, 'productId'), req.body.stock)); } catch (e) { next(e); }
});
vendorRoutes.get('/orders', async (req, res, next) => {
  try {
    const r = await svc.listVendorOrders(req.user!.sub, req.query.status as string, Number(req.query.page) || 1);
    sendSuccess(res, r.items, 200, { page: r.page, limit: r.limit, total: r.total });
  } catch (e) { next(e); }
});
vendorRoutes.patch('/orders/:id', async (req, res, next) => {
  try { sendSuccess(res, await svc.updateOrderStatus(req.user!.sub, paramId(req), req.body.status)); } catch (e) { next(e); }
});
vendorRoutes.get('/dashboard', async (req, res, next) => {
  try { sendSuccess(res, await svc.getVendorDashboard(req.user!.sub)); } catch (e) { next(e); }
});
vendorRoutes.get('/offers', async (req, res, next) => {
  try {
    sendSuccess(res, await import('../../lib/prisma.js').then(({ prisma }) =>
      prisma.offer.findMany({ where: { vendorId: req.user!.sub } }),
    ));
  } catch (e) { next(e); }
});
vendorRoutes.post('/offers', async (req, res, next) => {
  try {
    sendSuccess(res, await import('../../lib/prisma.js').then(({ prisma }) =>
      prisma.offer.create({ data: { ...req.body, vendorId: req.user!.sub, scope: 'VENDOR' } }),
    ), 201);
  } catch (e) { next(e); }
});
