import { prisma } from '../../lib/prisma.js';
import { AppError, NotFoundError } from '../../utils/errors.js';
import bcrypt from 'bcryptjs';

type VendorRequestStatus = 'DRAFT' | 'PENDING' | 'MORE_INFO_REQUIRED' | 'APPROVED' | 'REJECTED';

export async function getMyRequest(customerId: string) {
  return prisma.vendorRequest.findFirst({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    include: { district: { select: { id: true, name: true } }, area: { select: { id: true, name: true } } },
  });
}

export async function upsertDraft(customerId: string, data: Record<string, unknown>) {
  const cleanData = { ...data };
  if (cleanData.districtId === '') cleanData.districtId = null;
  if (cleanData.areaId === '') cleanData.areaId = null;

  const restrictedFields = [
    'id', 'customerId', 'status', 'createdAt', 'updatedAt',
    'district', 'area', 'customer', 'adminRemarks', 'rejectionReason',
    'reviewedBy', 'reviewedAt', 'submittedAt'
  ];
  restrictedFields.forEach(f => delete cleanData[f]);


  const existing = await prisma.vendorRequest.findFirst({
    where: { customerId, status: { in: ['DRAFT', 'MORE_INFO_REQUIRED'] } },
  });
  if (existing) {
    return prisma.vendorRequest.update({ where: { id: existing.id }, data: cleanData });
  }
  const blocking = await prisma.vendorRequest.findFirst({
    where: { customerId, status: { in: ['PENDING', 'APPROVED'] } },
  });
  if (blocking) {
    throw new AppError('CONFLICT', `Your application is already ${blocking.status.toLowerCase()}. You cannot submit a new one.`, 409);
  }
  return prisma.vendorRequest.create({ data: { customerId, ...cleanData } });
}

export async function submitApplication(customerId: string) {
  const request = await prisma.vendorRequest.findFirst({
    where: { customerId, status: { in: ['DRAFT', 'MORE_INFO_REQUIRED'] } },
  });
  if (!request) throw new NotFoundError('No draft application found');
  // Basic validation — required fields
  const required = ['shopName', 'ownerName', 'mobileNumber', 'districtId', 'areaId', 'address'];
  const missing = required.filter((k) => !request[k as keyof typeof request]);
  if (missing.length) throw new AppError('VALIDATION_ERROR', `Missing required fields: ${missing.join(', ')}`, 422);

  return prisma.vendorRequest.update({
    where: { id: request.id },
    data: { status: 'PENDING', submittedAt: new Date(), adminRemarks: null },
  });
}

// ─── Admin-facing service ──────────────────────────────────────────────────────

export async function listRequests(status?: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const where = status ? { status: status as VendorRequestStatus } : {};
  const [items, total] = await Promise.all([
    prisma.vendorRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true } },
        district: { select: { id: true, name: true } },
        area: { select: { id: true, name: true } },
      },
    }),
    prisma.vendorRequest.count({ where }),
  ]);
  return { items, total, page, limit };
}

export async function getRequest(id: string) {
  const req = await prisma.vendorRequest.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true, phone: true, email: true } },
      district: { select: { id: true, name: true } },
      area: { select: { id: true, name: true } },
    },
  });
  if (!req) throw new NotFoundError('Vendor request not found');
  return req;
}

export async function approveRequest(id: string, adminId: string) {
  const req = await getRequest(id);
  if (req.status !== 'PENDING') throw new AppError('BAD_REQUEST', 'Only PENDING requests can be approved', 400);

  // Generate a temporary password for the vendor
  const tempPassword = Math.random().toString(36).slice(-8) + 'V@1';
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  // Build a unique slug from shop name
  const baseSlug = (req.shopName ?? 'shop').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.vendor.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  // Find area with district
  const area = await prisma.area.findUnique({ where: { id: req.areaId ?? '' }, include: { district: true } });
  if (!area) throw new AppError('BAD_REQUEST', 'Area not found for this request', 400);

  // Create the Vendor account
  const vendor = await prisma.vendor.create({
    data: {
      areaId: area.id,
      districtId: area.districtId,
      customerId: req.customerId,
      email: req.email ?? `vendor_${id}@districtmart.com`,
      passwordHash,
      shopName: req.shopName ?? 'My Shop',
      slug,
      description: req.description,
      logoUrl: req.logoUrl,
      bannerUrl: req.bannerUrl,
      address: req.address ?? '',
      phone: req.mobileNumber ?? '',
      fssaiNumber: req.fssaiNumber,
      gstNumber: req.gstNumber,
      fssaiDocUrl: req.fssaiCertUrl,
      gstDocUrl: req.gstCertUrl,
      bankAccountNo: req.accountNumber,
      bankIfsc: req.ifscCode,
      bankHolderName: req.accountHolderName,
      deliveryRadius: req.deliveryRadius ?? 5,
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedBy: adminId,
    },
  });

  // Update the request
  await prisma.vendorRequest.update({
    where: { id },
    data: { status: 'APPROVED', reviewedBy: adminId, reviewedAt: new Date() },
  });

  // Notify the customer
  await prisma.notification.create({
    data: {
      customerId: req.customerId,
      type: 'VENDOR_APPROVED',
      title: '🎉 Vendor Application Approved!',
      body: `Congratulations! Your shop "${req.shopName}" has been approved. Login at the Vendor Panel with your email and temp password: ${tempPassword}`,
      data: { vendorId: vendor.id, tempPassword },
    },
  });

  return { vendor, tempPassword };
}

export async function rejectRequest(id: string, adminId: string, reason: string) {
  const req = await getRequest(id);
  if (!['PENDING', 'MORE_INFO_REQUIRED'].includes(req.status)) {
    throw new AppError('BAD_REQUEST', 'Only PENDING or MORE_INFO_REQUIRED requests can be rejected', 400);
  }
  const updated = await prisma.vendorRequest.update({
    where: { id },
    data: { status: 'REJECTED', rejectionReason: reason, reviewedBy: adminId, reviewedAt: new Date() },
  });
  await prisma.notification.create({
    data: {
      customerId: req.customerId,
      type: 'VENDOR_REJECTED',
      title: 'Vendor Application Update',
      body: `Your vendor application for "${req.shopName}" was not approved. Reason: ${reason}`,
      data: { requestId: id },
    },
  });
  return updated;
}

export async function requestMoreInfo(id: string, adminId: string, remarks: string) {
  const req = await getRequest(id);
  if (req.status !== 'PENDING') throw new AppError('BAD_REQUEST', 'Only PENDING requests can be flagged for more info', 400);
  const updated = await prisma.vendorRequest.update({
    where: { id },
    data: { status: 'MORE_INFO_REQUIRED', adminRemarks: remarks, reviewedBy: adminId, reviewedAt: new Date() },
  });
  await prisma.notification.create({
    data: {
      customerId: req.customerId,
      type: 'VENDOR_MORE_INFO',
      title: 'Action Required — Vendor Application',
      body: `More information is needed for your vendor application. Admin note: ${remarks}`,
      data: { requestId: id },
    },
  });
  return updated;
}

export async function getPendingCount() {
  return prisma.vendorRequest.count({ where: { status: 'PENDING' } });
}
