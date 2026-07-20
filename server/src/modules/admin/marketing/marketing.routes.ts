import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../../lib/prisma.js';
import { sendSuccess } from '../../../utils/response.js';
import { paramId } from '../../../utils/params.js';
import { NotFoundError } from '../../../utils/errors.js';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

// ─── Banners ───────────────────────────────────────────────────────────────────
router.get('/banners', async (_req, res, next) => {
  try {
    sendSuccess(res, await prisma.banner.findMany({ orderBy: { sortOrder: 'asc' }, include: { district: true } }));
  } catch (e) { next(e); }
});
router.post('/banners', async (req, res, next) => {
  try {
    const data = z.object({
      title: z.string(),
      imageUrl: z.string(),
      districtId: z.string().optional(),
      linkUrl: z.string().optional(),
      themeColor: z.string().optional(),
      themeColorEnd: z.string().optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
      startsAt: z.string().datetime().optional(),
      endsAt: z.string().datetime().optional()
    }).parse(req.body);
    sendSuccess(res, await prisma.banner.create({ data: { ...data, startsAt: data.startsAt ? new Date(data.startsAt) : undefined, endsAt: data.endsAt ? new Date(data.endsAt) : undefined } }), 201);
  } catch (e) { next(e); }
});
router.put('/banners/:id', async (req, res, next) => {
  try { sendSuccess(res, await prisma.banner.update({ where: { id: paramId(req) }, data: req.body })); } catch (e) { next(e); }
});
router.delete('/banners/:id', async (req, res, next) => {
  try { await prisma.banner.delete({ where: { id: paramId(req) } }); sendSuccess(res, { deleted: true }); } catch (e) { next(e); }
});

// ─── Micro Banners ─────────────────────────────────────────────────────────────
router.get('/micro-banners', async (_req, res, next) => {
  try {
    sendSuccess(res, await prisma.microBanner.findMany({ orderBy: { sortOrder: 'asc' } }));
  } catch (e) { next(e); }
});
router.post('/micro-banners', async (req, res, next) => {
  try {
    sendSuccess(res, await prisma.microBanner.create({ data: req.body }), 201);
  } catch (e) { next(e); }
});
router.put('/micro-banners/:id', async (req, res, next) => {
  try { sendSuccess(res, await prisma.microBanner.update({ where: { id: paramId(req) }, data: req.body })); } catch (e) { next(e); }
});
router.delete('/micro-banners/:id', async (req, res, next) => {
  try { await prisma.microBanner.delete({ where: { id: paramId(req) } }); sendSuccess(res, { deleted: true }); } catch (e) { next(e); }
});

// ─── Offers ────────────────────────────────────────────────────────────────────
router.get('/offers', async (_req, res, next) => {
  try { sendSuccess(res, await prisma.offer.findMany({ orderBy: { createdAt: 'desc' } })); } catch (e) { next(e); }
});
router.post('/offers', async (req, res, next) => {
  try { sendSuccess(res, await prisma.offer.create({ data: req.body }), 201); } catch (e) { next(e); }
});
router.put('/offers/:id', async (req, res, next) => {
  try { sendSuccess(res, await prisma.offer.update({ where: { id: paramId(req) }, data: req.body })); } catch (e) { next(e); }
});
router.delete('/offers/:id', async (req, res, next) => {
  try { await prisma.offer.delete({ where: { id: paramId(req) } }); sendSuccess(res, { deleted: true }); } catch (e) { next(e); }
});

// ─── Coupons ───────────────────────────────────────────────────────────────────
router.get('/coupons', async (_req, res, next) => {
  try { sendSuccess(res, await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })); } catch (e) { next(e); }
});
router.post('/coupons', async (req, res, next) => {
  try { sendSuccess(res, await prisma.coupon.create({ data: req.body }), 201); } catch (e) { next(e); }
});
router.put('/coupons/:id', async (req, res, next) => {
  try { sendSuccess(res, await prisma.coupon.update({ where: { id: paramId(req) }, data: req.body })); } catch (e) { next(e); }
});
router.delete('/coupons/:id', async (req, res, next) => {
  try { await prisma.coupon.delete({ where: { id: paramId(req) } }); sendSuccess(res, { deleted: true }); } catch (e) { next(e); }
});

// ─── Delivery Charges ──────────────────────────────────────────────────────────
router.get('/delivery-charges', async (_req, res, next) => {
  try { sendSuccess(res, await prisma.deliveryChargeRule.findMany()); } catch (e) { next(e); }
});
router.post('/delivery-charges', async (req, res, next) => {
  try { sendSuccess(res, await prisma.deliveryChargeRule.create({ data: req.body }), 201); } catch (e) { next(e); }
});
router.put('/delivery-charges/:id', async (req, res, next) => {
  try { sendSuccess(res, await prisma.deliveryChargeRule.update({ where: { id: paramId(req) }, data: req.body })); } catch (e) { next(e); }
});
router.delete('/delivery-charges/:id', async (req, res, next) => {
  try { await prisma.deliveryChargeRule.delete({ where: { id: paramId(req) } }); sendSuccess(res, { deleted: true }); } catch (e) { next(e); }
});

export const marketingRoutes = router;
