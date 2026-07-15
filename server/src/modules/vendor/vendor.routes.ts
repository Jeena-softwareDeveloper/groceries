import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth.service.js';
import { sendSuccess } from '../../utils/response.js';
import { paramId } from '../../utils/params.js';
import * as svc from './vendor.service.js';

export const vendorRoutes = Router();
vendorRoutes.use(authenticate, authorize('VENDOR'));

// ─── Categories (for product form dropdowns) ──────────────────────────────────
vendorRoutes.get('/categories', async (_req, res, next) => {
  try {
    const { prisma } = await import('../../lib/prisma.js');
    sendSuccess(res, await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, slug: true, children: { select: { id: true, name: true, slug: true } } },
    }));
  } catch (e) { next(e); }
});

// ─── Dashboard ────────────────────────────────────────────────────────────────
vendorRoutes.get('/dashboard', async (req, res, next) => {
  try { sendSuccess(res, await svc.getVendorDashboard(req.user!.sub)); } catch (e) { next(e); }
});

// ─── Profile ──────────────────────────────────────────────────────────────────
vendorRoutes.get('/profile', async (req, res, next) => {
  try { sendSuccess(res, await svc.getVendorProfile(req.user!.sub)); } catch (e) { next(e); }
});
vendorRoutes.put('/profile', async (req, res, next) => {
  try { sendSuccess(res, await svc.updateVendorProfile(req.user!.sub, req.body)); } catch (e) { next(e); }
});

// ─── Products ─────────────────────────────────────────────────────────────────
vendorRoutes.get('/products', async (req, res, next) => {
  try {
    const r = await svc.listVendorProducts(
      req.user!.sub,
      Number(req.query.page) || 1,
      Number(req.query.limit) || 20,
      req.query.status as string | undefined,
      req.query.search as string | undefined,
    );
    sendSuccess(res, r.items, 200, { page: r.page, limit: r.limit, total: r.total });
  } catch (e) { next(e); }
});
vendorRoutes.post('/products', async (req, res, next) => {
  try { sendSuccess(res, await svc.createProduct(req.user!.sub, req.body), 201); } catch (e) { next(e); }
});
vendorRoutes.put('/products/:id', async (req, res, next) => {
  try { sendSuccess(res, await svc.updateProduct(req.user!.sub, paramId(req), req.body)); } catch (e) { next(e); }
});
vendorRoutes.post('/products/:id/submit-approval', async (req, res, next) => {
  try { sendSuccess(res, await svc.submitProductForApproval(req.user!.sub, paramId(req))); } catch (e) { next(e); }
});
vendorRoutes.post('/products/:id/publish', async (req, res, next) => {
  try { sendSuccess(res, await svc.publishProduct(req.user!.sub, paramId(req), 'PUBLISHED')); } catch (e) { next(e); }
});
vendorRoutes.post('/products/:id/unpublish', async (req, res, next) => {
  try { sendSuccess(res, await svc.publishProduct(req.user!.sub, paramId(req), 'DRAFT')); } catch (e) { next(e); }
});
vendorRoutes.delete('/products/:id', async (req, res, next) => {
  try { await svc.deleteProduct(req.user!.sub, paramId(req)); sendSuccess(res, { deleted: true }); } catch (e) { next(e); }
});

// ─── Inventory ────────────────────────────────────────────────────────────────
vendorRoutes.get('/inventory', async (req, res, next) => {
  try {
    const r = await svc.listInventory(req.user!.sub, Number(req.query.page) || 1, Number(req.query.limit) || 50);
    sendSuccess(res, r.items, 200, { page: r.page, limit: r.limit, total: r.total });
  } catch (e) { next(e); }
});
vendorRoutes.put('/inventory/:productId', async (req, res, next) => {
  try { sendSuccess(res, await svc.updateInventory(req.user!.sub, paramId(req, 'productId'), Number(req.body.stock))); } catch (e) { next(e); }
});

// ─── Orders ───────────────────────────────────────────────────────────────────
vendorRoutes.get('/orders', async (req, res, next) => {
  try {
    const r = await svc.listVendorOrders(
      req.user!.sub,
      req.query.status as string | undefined,
      Number(req.query.page) || 1,
      Number(req.query.limit) || 20,
      req.query.search as string | undefined,
    );
    sendSuccess(res, r.items, 200, { page: r.page, limit: r.limit, total: r.total });
  } catch (e) { next(e); }
});
vendorRoutes.patch('/orders/:id', async (req, res, next) => {
  try { sendSuccess(res, await svc.updateOrderStatus(req.user!.sub, paramId(req), req.body.status)); } catch (e) { next(e); }
});

// ─── Customers ────────────────────────────────────────────────────────────────
vendorRoutes.get('/customers', async (req, res, next) => {
  try {
    const r = await svc.listVendorCustomers(
      req.user!.sub,
      Number(req.query.page) || 1,
      Number(req.query.limit) || 20,
      req.query.search as string | undefined,
    );
    sendSuccess(res, r.items, 200, { page: r.page, limit: r.limit, total: r.total });
  } catch (e) { next(e); }
});

// ─── Finance ─────────────────────────────────────────────────────────────────
vendorRoutes.get('/finance', async (req, res, next) => {
  try { sendSuccess(res, await svc.getVendorFinance(req.user!.sub)); } catch (e) { next(e); }
});

// ─── Notifications ────────────────────────────────────────────────────────────
vendorRoutes.get('/notifications', async (req, res, next) => {
  try {
    const r = await svc.listVendorNotifications(req.user!.sub, Number(req.query.page) || 1, Number(req.query.limit) || 20);
    sendSuccess(res, r.items, 200, { page: r.page, limit: r.limit, total: r.total });
  } catch (e) { next(e); }
});
vendorRoutes.patch('/notifications/:id/read', async (req, res, next) => {
  try { sendSuccess(res, await svc.markNotificationRead(req.user!.sub, paramId(req))); } catch (e) { next(e); }
});
vendorRoutes.post('/notifications/read-all', async (req, res, next) => {
  try { sendSuccess(res, await svc.markAllNotificationsRead(req.user!.sub)); } catch (e) { next(e); }
});

// ─── Offers ───────────────────────────────────────────────────────────────────
vendorRoutes.get('/offers', async (req, res, next) => {
  try { sendSuccess(res, await svc.listVendorOffers(req.user!.sub)); } catch (e) { next(e); }
});
vendorRoutes.post('/offers', async (req, res, next) => {
  try { sendSuccess(res, await svc.createVendorOffer(req.user!.sub, req.body), 201); } catch (e) { next(e); }
});
vendorRoutes.delete('/offers/:id', async (req, res, next) => {
  try { await svc.deleteVendorOffer(req.user!.sub, paramId(req)); sendSuccess(res, { deleted: true }); } catch (e) { next(e); }
});
