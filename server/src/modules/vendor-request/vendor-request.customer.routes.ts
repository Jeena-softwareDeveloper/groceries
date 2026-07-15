import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth.service.js';
import { sendSuccess } from '../../utils/response.js';
import * as svc from './vendor-request.service.js';
import { prisma } from '../../lib/prisma.js';

export const vendorRequestCustomerRoutes = Router();
const auth = [authenticate, authorize('CUSTOMER', 'VENDOR')] as const;

async function getCustomerId(req: any): Promise<string> {
  const user = req.user!;
  if (user.role === 'VENDOR') {
    const vendor = await prisma.vendor.findUnique({
      where: { id: user.sub },
      select: { customerId: true },
    });
    if (vendor?.customerId) return vendor.customerId;
  }
  return user.sub;
}

// GET /customer/vendor-request — fetch own application status
vendorRequestCustomerRoutes.get('/', ...auth, async (req, res, next) => {
  try {
    const customerId = await getCustomerId(req);
    const request = await svc.getMyRequest(customerId);
    sendSuccess(res, request);
  } catch (e) { next(e); }
});

// POST /customer/vendor-request — create or update draft
vendorRequestCustomerRoutes.post('/', ...auth, async (req, res, next) => {
  try {
    const customerId = await getCustomerId(req);
    const request = await svc.upsertDraft(customerId, req.body);
    sendSuccess(res, request, 201);
  } catch (e) { next(e); }
});

// PUT /customer/vendor-request — update draft/more-info fields
vendorRequestCustomerRoutes.put('/', ...auth, async (req, res, next) => {
  try {
    const customerId = await getCustomerId(req);
    const request = await svc.upsertDraft(customerId, req.body);
    sendSuccess(res, request);
  } catch (e) { next(e); }
});

// POST /customer/vendor-request/submit — submit application
vendorRequestCustomerRoutes.post('/submit', ...auth, async (req, res, next) => {
  try {
    const customerId = await getCustomerId(req);
    const request = await svc.submitApplication(customerId);
    sendSuccess(res, request);
  } catch (e) { next(e); }
});
