import { Router } from 'express';
import { prisma } from '../../../lib/prisma.js';
import { sendSuccess } from '../../../utils/response.js';
import { paramId } from '../../../utils/params.js';
import { NotFoundError } from '../../../utils/errors.js';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

router.get('/revenue', async (req, res, next) => {
  try {
    const days = Number(req.query.days) || 30;
    const since = new Date(Date.now() - days * 86400000);
    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: since }, status: { not: 'CANCELLED' } },
      select: { grandTotal: true, createdAt: true },
    });
    const total = orders.reduce((s, o) => s + Number(o.grandTotal), 0);
    sendSuccess(res, { total, orderCount: orders.length, period: `${days}d` });
  } catch (e) { next(e); }
});

router.get('/orders', async (_req, res, next) => {
  try {
    const [total, byStatus] = await Promise.all([
      prisma.order.count(),
      prisma.order.groupBy({ by: ['status'], _count: true }),
    ]);
    sendSuccess(res, { total, byStatus });
  } catch (e) { next(e); }
});

router.get('/customers', async (_req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const [total, newCustomers] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    ]);
    sendSuccess(res, { total, newLast30Days: newCustomers });
  } catch (e) { next(e); }
});

router.get('/vendors', async (_req, res, next) => {
  try {
    const byStatus = await prisma.vendor.groupBy({ by: ['status'], _count: true });
    const topVendors = await prisma.order.groupBy({
      by: ['vendorId'],
      _sum: { grandTotal: true },
      _count: true,
      orderBy: { _sum: { grandTotal: 'desc' } },
      take: 10,
    });
    const vendorIds = topVendors.map((v) => v.vendorId);
    const vendors = await prisma.vendor.findMany({ where: { id: { in: vendorIds } }, select: { id: true, shopName: true } });
    const vendorMap = Object.fromEntries(vendors.map((v) => [v.id, v.shopName]));
    sendSuccess(res, {
      byStatus,
      topVendors: topVendors.map((v) => ({
        vendorId: v.vendorId,
        shopName: vendorMap[v.vendorId],
        revenue: v._sum.grandTotal,
        orders: v._count,
      })),
    });
  } catch (e) { next(e); }
});

export const analyticsRoutes = router;

// ─── Customers admin ───────────────────────────────────────────────────────────
export const customersAdminRoutes = Router();

customersAdminRoutes.get('/', async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search as string | undefined;
    const where = search ? { OR: [{ phone: { contains: search } }, { name: { contains: search, mode: 'insensitive' as const } }, { email: { contains: search, mode: 'insensitive' as const } }] } : {};
    const [items, total] = await Promise.all([
      prisma.customer.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.customer.count({ where }),
    ]);
    sendSuccess(res, items, 200, { page, limit, total });
  } catch (e) { next(e); }
});

customersAdminRoutes.get('/:id', async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: paramId(req) },
      include: { addresses: true, orders: { take: 10, orderBy: { createdAt: 'desc' } } },
    });
    if (!customer) throw new NotFoundError('Customer not found');
    sendSuccess(res, customer);
  } catch (e) { next(e); }
});

customersAdminRoutes.post('/:id/block', async (req, res, next) => {
  try {
    sendSuccess(res, await prisma.customer.update({ where: { id: paramId(req) }, data: { isBlocked: true } }));
  } catch (e) { next(e); }
});

customersAdminRoutes.post('/:id/unblock', async (req, res, next) => {
  try {
    sendSuccess(res, await prisma.customer.update({ where: { id: paramId(req) }, data: { isBlocked: false } }));
  } catch (e) { next(e); }
});

// ─── Notifications broadcast ───────────────────────────────────────────────────
export const notificationsAdminRoutes = Router();

notificationsAdminRoutes.post('/broadcast', async (req, res, next) => {
  try {
    const { title, body, districtId } = req.body as { title: string; body: string; districtId?: string };
    const customers = await prisma.customer.findMany({
      where: { isBlocked: false },
      select: { id: true },
      take: 1000,
    });
    await prisma.notification.createMany({
      data: customers.map((c) => ({
        customerId: c.id,
        type: 'BROADCAST' as const,
        title,
        body,
        data: districtId ? { districtId } : undefined,
      })),
    });
    sendSuccess(res, { sent: customers.length });
  } catch (e) { next(e); }
});

// ─── Static pages CMS ──────────────────────────────────────────────────────────
export const staticPagesRoutes = Router();

staticPagesRoutes.get('/', async (_req, res, next) => {
  try { sendSuccess(res, await prisma.staticPage.findMany()); } catch (e) { next(e); }
});
staticPagesRoutes.put('/:slug', async (req, res, next) => {
  try {
    const { title, content, isActive } = req.body;
    sendSuccess(res, await prisma.staticPage.upsert({
      where: { slug: req.params.slug },
      create: { slug: req.params.slug, title, content, isActive: isActive ?? true },
      update: { title, content, isActive },
    }));
  } catch (e) { next(e); }
});
