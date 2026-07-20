import { prisma } from '../../lib/prisma.js';
import { cacheDel, cacheDelPattern } from '../../lib/redis.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../../utils/errors.js';

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function getVendorProfile(vendorId: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: { area: { include: { district: true } } },
  });
  if (!vendor) throw new NotFoundError('Vendor not found');
  return vendor;
}

export async function updateVendorProfile(vendorId: string, data: Record<string, unknown>) {
  const allowed = ['shopName', 'description', 'logoUrl', 'bannerUrl', 'address', 'phone', 'minOrderValue', 'deliveryRadius', 'isOpen', 'operatingHours'];
  const filtered = Object.fromEntries(Object.entries(data).filter(([k]) => allowed.includes(k)));
  return prisma.vendor.update({ where: { id: vendorId }, data: filtered });
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export async function getVendorDashboard(vendorId: string) {
  const now = new Date();

  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7);
  const monthStart = new Date(now); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

  const [
    todaySalesAgg, weeklySalesAgg, monthlySalesAgg, totalRevenueAgg,
    ordersByStatus,
    productCounts, lowStockItems, outOfStockItems,
    recentOrders, bestSellers,
    vendor, notifCount,
    pendingApprovals, rejectedApprovals,
  ] = await Promise.all([
    // Sales aggregations
    prisma.order.aggregate({ where: { vendorId, createdAt: { gte: todayStart }, status: { not: 'CANCELLED' } }, _sum: { grandTotal: true }, _count: true }),
    prisma.order.aggregate({ where: { vendorId, createdAt: { gte: weekStart }, status: { not: 'CANCELLED' } }, _sum: { grandTotal: true }, _count: true }),
    prisma.order.aggregate({ where: { vendorId, createdAt: { gte: monthStart }, status: { not: 'CANCELLED' } }, _sum: { grandTotal: true }, _count: true }),
    prisma.order.aggregate({ where: { vendorId, status: { not: 'CANCELLED' } }, _sum: { grandTotal: true } }),

    // Order status breakdown
    prisma.order.groupBy({ by: ['status'], where: { vendorId }, _count: true }),

    // Product status breakdown
    prisma.product.groupBy({ by: ['status'], where: { vendorId }, _count: true }),

    // Low stock (> 0 but <= 10)
    prisma.inventory.findMany({
      where: { product: { vendorId }, stock: { gt: 0, lte: 10 } },
      include: { product: { select: { id: true, name: true } } },
      take: 10,
    }),

    // Out of stock
    prisma.inventory.findMany({
      where: { product: { vendorId }, stock: { lte: 0 } },
      include: { product: { select: { id: true, name: true } } },
      take: 10,
    }),

    // Recent orders
    prisma.order.findMany({
      where: { vendorId },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: { select: { name: true } } } },
        customer: { select: { id: true, name: true, phone: true } },
      },
    }),

    // Best selling products (by order item count)
    prisma.orderItem.groupBy({
      by: ['productId'],
      where: { order: { vendorId, status: { not: 'CANCELLED' } } },
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),

    // Vendor details (rating, ratingCount)
    prisma.vendor.findUnique({ where: { id: vendorId }, select: { rating: true, ratingCount: true } }),

    // Unread notification count
    prisma.notification.count({ where: { vendorId, isRead: false } }),

    // Product approvals
    prisma.productApproval.count({ where: { vendorId, status: 'PENDING' } }),
    prisma.productApproval.count({ where: { vendorId, status: 'REJECTED' } }),
  ]);

  // Resolve best sellers product names
  const bestSellerProductIds = bestSellers.map((b) => b.productId);
  const bestSellerProducts = bestSellerProductIds.length > 0
    ? await prisma.product.findMany({
        where: { id: { in: bestSellerProductIds } },
        select: {
          id: true,
          name: true,
          images: { where: { isPrimary: true }, take: 1, select: { url: true } },
        },
      })
    : [];
  const productMap = Object.fromEntries(bestSellerProducts.map((p) => [p.id, p]));

  // Unique customers
  const uniqueCustomers = await prisma.order.findMany({
    where: { vendorId },
    select: { customerId: true },
    distinct: ['customerId'],
  });

  const statusMap = Object.fromEntries(ordersByStatus.map((s) => [s.status, s._count]));
  const productStatusMap = Object.fromEntries(productCounts.map((p) => [p.status, p._count]));

  return {
    sales: {
      today: Number(todaySalesAgg._sum.grandTotal ?? 0),
      todayOrders: todaySalesAgg._count,
      weekly: Number(weeklySalesAgg._sum.grandTotal ?? 0),
      weeklyOrders: weeklySalesAgg._count,
      monthly: Number(monthlySalesAgg._sum.grandTotal ?? 0),
      monthlyOrders: monthlySalesAgg._count,
      totalRevenue: Number(totalRevenueAgg._sum.grandTotal ?? 0),
    },
    orders: {
      pending: statusMap['PLACED'] ?? 0,
      accepted: statusMap['CONFIRMED'] ?? 0,
      packed: statusMap['PACKED'] ?? 0,
      outForDelivery: statusMap['OUT_FOR_DELIVERY'] ?? 0,
      delivered: statusMap['DELIVERED'] ?? 0,
      cancelled: statusMap['CANCELLED'] ?? 0,
      returned: statusMap['RETURNED'] ?? 0,
    },
    products: {
      active: productStatusMap['PUBLISHED'] ?? 0,
      draft: productStatusMap['DRAFT'] ?? 0,
      pendingApproval: pendingApprovals,
      rejected: rejectedApprovals,
      lowStock: lowStockItems.length,
      outOfStock: outOfStockItems.length,
    },
    customers: { total: uniqueCustomers.length },
    rating: { average: vendor?.rating ?? 0, count: vendor?.ratingCount ?? 0 },
    notifications: { unread: notifCount },
    recentOrders,
    bestSellers: bestSellers.map((b) => ({
      productId: b.productId,
      product: productMap[b.productId],
      totalSold: b._sum.quantity ?? 0,
      totalRevenue: Number(b._sum.total ?? 0),
    })),
    lowStockItems,
    outOfStockItems,
  };
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function listVendorProducts(vendorId: string, page = 1, limit = 20, status?: string, search?: string) {
  const skip = (page - 1) * limit;
  const where = {
    vendorId,
    ...(status ? { status } : {}),
    ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        inventory: true,
        category: { select: { id: true, name: true } },
        approvals: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);
  return { items, total, page, limit };
}

export async function createProduct(vendorId: string, data: Record<string, unknown>) {
  const { categoryId, subCategoryId, name, slug, description, brand, mrp, sellingPrice, unit, weight, tags, stock } = data as {
    categoryId: string; subCategoryId?: string; name: string; slug: string; description?: string;
    brand?: string; mrp: number; sellingPrice: number; unit: string; weight?: string; tags?: string[]; stock?: number;
  };
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new ValidationError('Category not found — vendors cannot create categories');
  if (subCategoryId) {
    const sub = await prisma.category.findFirst({ where: { id: subCategoryId, parentId: categoryId } });
    if (!sub) throw new ValidationError('Invalid subcategory');
  }
  const product = await prisma.product.create({
    data: {
      vendorId, categoryId, subCategoryId, name, slug, description, brand,
      mrp, sellingPrice, unit, weight,
      status: 'DRAFT',
      tags: Array.isArray(tags) ? tags.join(',') : (typeof tags === 'string' ? tags : null),
      inventory: { create: { stock: stock ?? 0 } },
    },
    include: { inventory: true, category: true, images: true },
  });
  await invalidateVendorCache(vendorId);
  return product;
}

export async function updateProduct(vendorId: string, productId: string, data: Record<string, unknown>) {
  const product = await prisma.product.findFirst({ where: { id: productId, vendorId } });
  if (!product) throw new NotFoundError('Product not found');
  if (data.categoryId && data.categoryId !== product.categoryId) {
    const cat = await prisma.category.findUnique({ where: { id: data.categoryId as string } });
    if (!cat) throw new ValidationError('Category not found');
  }

  // Allow stock update inline
  const { stock, ...productData } = data as any;

  // Strip protected fields
  const protectedFields = ['id', 'vendorId', 'createdAt', 'updatedAt', 'status'];
  protectedFields.forEach((f) => delete productData[f]);

  const updated = await prisma.product.update({
    where: { id: productId },
    data: { ...productData, status: 'DRAFT' }, // editing resets to DRAFT, requires re-approval
    include: { inventory: true, images: true },
  });

  if (stock !== undefined) {
    await prisma.inventory.upsert({
      where: { productId },
      create: { productId, stock: Number(stock) },
      update: { stock: Number(stock) },
    });
  }

  await invalidateVendorCache(vendorId);
  return updated;
}

export async function submitProductForApproval(vendorId: string, productId: string) {
  const product = await prisma.product.findFirst({ where: { id: productId, vendorId } });
  if (!product) throw new NotFoundError('Product not found');
  if (!product.name || !product.categoryId || !product.mrp || !product.sellingPrice || !product.unit) {
    throw new ValidationError('Product is missing required fields (name, category, price, unit)');
  }

  // Update product status to PENDING_REVIEW
  await prisma.product.update({ where: { id: productId }, data: { status: 'PENDING_REVIEW' } });

  // Create or update approval request
  const existing = await prisma.productApproval.findFirst({
    where: { productId, status: { in: ['PENDING', 'CHANGES_REQUESTED'] } },
  });

  if (existing) {
    return prisma.productApproval.update({
      where: { id: existing.id },
      data: { status: 'PENDING', rejectionReason: null, adminNotes: null, reviewedAt: null, reviewedBy: null },
    });
  }

  return prisma.productApproval.create({
    data: { productId, vendorId, status: 'PENDING' },
  });
}

export async function publishProduct(vendorId: string, productId: string, status: string) {
  const product = await prisma.product.findFirst({ where: { id: productId, vendorId } });
  if (!product) throw new NotFoundError('Product not found');
  const updated = await prisma.product.update({ where: { id: productId }, data: { status } });
  await invalidateVendorCache(vendorId);
  return updated;
}

export async function deleteProduct(vendorId: string, productId: string) {
  const product = await prisma.product.findFirst({ where: { id: productId, vendorId } });
  if (!product) throw new NotFoundError('Product not found');
  await prisma.product.delete({ where: { id: productId } });
  await invalidateVendorCache(vendorId);
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export async function updateInventory(vendorId: string, productId: string, stock: number) {
  const product = await prisma.product.findFirst({ where: { id: productId, vendorId } });
  if (!product) throw new NotFoundError('Product not found');
  return prisma.inventory.upsert({
    where: { productId },
    create: { productId, stock },
    update: { stock },
  });
}

export async function listInventory(vendorId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.inventory.findMany({
      where: { product: { vendorId } },
      skip,
      take: limit,
      include: { product: { select: { id: true, name: true, status: true, sellingPrice: true } } },
      orderBy: { stock: 'asc' },
    }),
    prisma.inventory.count({ where: { product: { vendorId } } }),
  ]);
  return { items, total, page, limit };
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function listVendorOrders(vendorId: string, status?: string, page = 1, limit = 20, search?: string) {
  const skip = (page - 1) * limit;
  const where: any = { vendorId };
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search } },
      { customer: { name: { contains: search, mode: 'insensitive' as const } } },
    ];
  }
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      include: {
        items: { include: { product: { select: { name: true, images: { where: { isPrimary: true }, take: 1 } } } } },
        customer: { select: { id: true, name: true, phone: true } },
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);
  return { items, total, page, limit };
}

export async function updateOrderStatus(vendorId: string, orderId: string, status: string) {
  const order = await prisma.order.findFirst({ where: { id: orderId, vendorId } });
  if (!order) throw new NotFoundError('Order not found');

  const validTransitions: Record<string, string[]> = {
    PLACED: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PACKED', 'CANCELLED'],
    PACKED: ['OUT_FOR_DELIVERY', 'CANCELLED'],
    OUT_FOR_DELIVERY: ['DELIVERED', 'RETURNED'],
    DELIVERED: ['RETURNED'],
    CANCELLED: [],
    RETURNED: [],
  };
  if (!validTransitions[order.status]?.includes(status)) {
    throw new ValidationError(`Cannot transition from ${order.status} to ${status}`);
  }

  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: status as any,
      ...(status === 'DELIVERED' ? { deliveredAt: new Date() } : {}),
      ...(status === 'CANCELLED' ? { cancelledAt: new Date() } : {}),
    },
  });
}

// ─── Customers ────────────────────────────────────────────────────────────────

export async function listVendorCustomers(vendorId: string, page = 1, limit = 20, search?: string) {
  const skip = (page - 1) * limit;

  // Get unique customers with aggregates
  const customerStats = await prisma.order.groupBy({
    by: ['customerId'],
    where: {
      vendorId,
      status: { not: 'CANCELLED' },
      ...(search ? { customer: { name: { contains: search } } } : {}),
    },
    _sum: { grandTotal: true },
    _count: true,
    orderBy: { _sum: { grandTotal: 'desc' } },
    take: limit,
    skip,
  });

  const total = await prisma.order.findMany({
    where: { vendorId, status: { not: 'CANCELLED' } },
    select: { customerId: true },
    distinct: ['customerId'],
  }).then((r) => r.length);

  const customerIds = customerStats.map((c) => c.customerId);
  const customers = await prisma.customer.findMany({
    where: { id: { in: customerIds } },
    select: { id: true, name: true, phone: true, email: true, createdAt: true },
  });
  const customerMap = Object.fromEntries(customers.map((c) => [c.id, c]));

  const items = customerStats.map((s) => ({
    customer: customerMap[s.customerId],
    orderCount: s._count,
    lifetimeValue: Number(s._sum?.grandTotal ?? 0),
  }));

  return { items, total, page, limit };
}

// ─── Finance ──────────────────────────────────────────────────────────────────

export async function getVendorFinance(vendorId: string) {
  const [totalRevenue, monthlyRevenue, orders] = await Promise.all([
    prisma.order.aggregate({
      where: { vendorId, status: 'DELIVERED' },
      _sum: { grandTotal: true },
    }),
    prisma.order.aggregate({
      where: { vendorId, status: 'DELIVERED', deliveredAt: { gte: new Date(new Date().setDate(1)) } },
      _sum: { grandTotal: true },
    }),
    prisma.order.findMany({
      where: { vendorId, status: 'DELIVERED' },
      select: { orderNumber: true, grandTotal: true, deliveredAt: true, createdAt: true },
      orderBy: { deliveredAt: 'desc' },
      take: 50,
    }),
  ]);

  const commissionRate = 0.05; // 5% platform commission
  const total = Number(totalRevenue._sum.grandTotal ?? 0);
  const monthly = Number(monthlyRevenue._sum.grandTotal ?? 0);
  const commission = total * commissionRate;
  const netRevenue = total - commission;

  return {
    summary: {
      totalRevenue: total,
      monthlyRevenue: monthly,
      commission,
      netRevenue,
      pendingPayout: monthly * (1 - commissionRate), // simplified
    },
    transactions: orders.map((o) => ({
      reference: o.orderNumber,
      amount: Number(o.grandTotal),
      commission: Number(o.grandTotal) * commissionRate,
      net: Number(o.grandTotal) * (1 - commissionRate),
      date: o.deliveredAt ?? o.createdAt,
    })),
  };
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function listVendorNotifications(vendorId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.notification.findMany({
      where: { vendorId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where: { vendorId } }),
  ]);
  return { items, total, page, limit };
}

export async function markNotificationRead(vendorId: string, notifId: string) {
  const notif = await prisma.notification.findFirst({ where: { id: notifId, vendorId } });
  if (!notif) throw new NotFoundError('Notification not found');
  return prisma.notification.update({ where: { id: notifId }, data: { isRead: true } });
}

export async function markAllNotificationsRead(vendorId: string) {
  return prisma.notification.updateMany({ where: { vendorId, isRead: false }, data: { isRead: true } });
}

// ─── Offers ───────────────────────────────────────────────────────────────────

export async function listVendorOffers(vendorId: string) {
  return prisma.offer.findMany({ where: { vendorId }, orderBy: { createdAt: 'desc' } });
}

export async function createVendorOffer(vendorId: string, data: Record<string, unknown>) {
  const { title, description, discountPct, discountAmt, minOrder, startsAt, endsAt } = data as any;
  return prisma.offer.create({
    data: {
      title,
      description,
      discountPct: discountPct ? Number(discountPct) : null,
      discountAmt: discountAmt ? Number(discountAmt) : null,
      minOrder: minOrder ? Number(minOrder) : null,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
      scope: 'VENDOR',
      vendorId,
      isActive: false, // only active after admin approval
      approvalStatus: 'PENDING',
    },
  });
}

export async function deleteVendorOffer(vendorId: string, offerId: string) {
  const offer = await prisma.offer.findFirst({ where: { id: offerId, vendorId } });
  if (!offer) throw new NotFoundError('Offer not found');
  return prisma.offer.delete({ where: { id: offerId } });
}

// ─── Admin: Product Approval ─────────────────────────────────────────────────

export async function listProductApprovals(status?: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const where = status ? { status } : {};
  const [items, total] = await Promise.all([
    prisma.productApproval.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            category: { select: { id: true, name: true } },
            inventory: true,
            vendor: { select: { id: true, shopName: true, email: true, phone: true, status: true, rating: true } },
          },
        },
      },
    }),
    prisma.productApproval.count({ where }),
  ]);
  return { items, total, page, limit };
}

export async function approveProductApproval(approvalId: string, adminId: string) {
  const approval = await prisma.productApproval.findUnique({ where: { id: approvalId } });
  if (!approval) throw new NotFoundError('Approval request not found');
  if (approval.status !== 'PENDING') throw new ValidationError('Only PENDING approvals can be approved');

  await prisma.productApproval.update({
    where: { id: approvalId },
    data: { status: 'APPROVED', reviewedBy: adminId, reviewedAt: new Date() },
  });

  await prisma.product.update({ where: { id: approval.productId }, data: { status: 'PUBLISHED' } });
  await cacheDelPattern('home:feed:*');

  // Notify vendor
  await prisma.notification.create({
    data: {
      vendorId: approval.vendorId,
      type: 'PRODUCT_APPROVED',
      title: '✅ Product Approved',
      body: 'Your product has been approved and is now visible to customers.',
      data: { productId: approval.productId },
    },
  });

  return approval;
}

export async function rejectProductApproval(approvalId: string, adminId: string, reason: string) {
  const approval = await prisma.productApproval.findUnique({ where: { id: approvalId } });
  if (!approval) throw new NotFoundError('Approval request not found');

  await prisma.productApproval.update({
    where: { id: approvalId },
    data: { status: 'REJECTED', rejectionReason: reason, reviewedBy: adminId, reviewedAt: new Date() },
  });

  await prisma.product.update({ where: { id: approval.productId }, data: { status: 'DRAFT' } });

  await prisma.notification.create({
    data: {
      vendorId: approval.vendorId,
      type: 'PRODUCT_REJECTED',
      title: '❌ Product Not Approved',
      body: `Your product was rejected. Reason: ${reason}`,
      data: { productId: approval.productId },
    },
  });

  return approval;
}

export async function requestProductChanges(approvalId: string, adminId: string, notes: string) {
  const approval = await prisma.productApproval.findUnique({ where: { id: approvalId } });
  if (!approval) throw new NotFoundError('Approval request not found');

  await prisma.productApproval.update({
    where: { id: approvalId },
    data: { status: 'CHANGES_REQUESTED', adminNotes: notes, reviewedBy: adminId, reviewedAt: new Date() },
  });

  await prisma.product.update({ where: { id: approval.productId }, data: { status: 'DRAFT' } });

  await prisma.notification.create({
    data: {
      vendorId: approval.vendorId,
      type: 'PRODUCT_CHANGES_REQUESTED',
      title: '✏️ Changes Requested for Your Product',
      body: `Admin has requested changes: ${notes}`,
      data: { productId: approval.productId },
    },
  });

  return approval;
}

// ─── Admin: Offer Approval ────────────────────────────────────────────────────

export async function listPendingOffers(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.offer.findMany({
      where: { approvalStatus: 'PENDING', scope: 'VENDOR' },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { vendor: { select: { id: true, shopName: true } } },
    }),
    prisma.offer.count({ where: { approvalStatus: 'PENDING', scope: 'VENDOR' } }),
  ]);
  return { items, total, page, limit };
}

export async function approveOffer(offerId: string) {
  return prisma.offer.update({ where: { id: offerId }, data: { approvalStatus: 'APPROVED', isActive: true } });
}

export async function rejectOffer(offerId: string, reason: string) {
  return prisma.offer.update({ where: { id: offerId }, data: { approvalStatus: 'REJECTED', isActive: false } });
}

// ─── Cache ─────────────────────────────────────────────────────────────────────

async function invalidateVendorCache(vendorId: string) {
  await cacheDelPattern('home:feed:*');
  await cacheDel(`shop:${vendorId}:products`);
}

export async function assertVendorAccess(userId: string, vendorId: string | null | undefined) {
  if (!vendorId || userId !== vendorId) throw new ForbiddenError('Access denied');
}
