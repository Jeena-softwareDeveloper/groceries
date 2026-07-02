import { prisma } from '../../../lib/prisma.js';
import { NotFoundError } from '../../../utils/errors.js';

export async function listVendors(status?: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const where = status ? { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' } : {};
  const [items, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { area: { include: { district: true } } },
    }),
    prisma.vendor.count({ where }),
  ]);
  return { items, total, page, limit };
}

export async function getVendor(id: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: { area: { include: { district: true } }, staff: true },
  });
  if (!vendor) throw new NotFoundError('Vendor not found');
  return vendor;
}

export async function approveVendor(id: string, adminId: string) {
  await getVendor(id);
  return prisma.vendor.update({
    where: { id },
    data: { status: 'APPROVED', approvedAt: new Date(), approvedBy: adminId, rejectionReason: null },
  });
}

export async function rejectVendor(id: string, reason: string) {
  await getVendor(id);
  return prisma.vendor.update({
    where: { id },
    data: { status: 'REJECTED', rejectionReason: reason },
  });
}

export async function suspendVendor(id: string) {
  await getVendor(id);
  return prisma.vendor.update({ where: { id }, data: { status: 'SUSPENDED' } });
}
