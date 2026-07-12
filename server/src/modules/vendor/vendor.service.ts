import { prisma } from '../../lib/prisma.js';
import { cacheDel, cacheDelPattern } from '../../lib/redis.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../../utils/errors.js';


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

export async function listVendorProducts(vendorId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where: { vendorId },
      skip,
      take: limit,
      include: { images: true, inventory: true, category: true, subCategory: true },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.product.count({ where: { vendorId } }),
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
      tags: (tags ?? []) as ('FEATURED' | 'BEST_SELLER' | 'NEW_ARRIVAL' | 'INSTANT_DELIVERY')[],
      inventory: { create: { stock: stock ?? 0 } },
    },
    include: { inventory: true, category: true },
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
  const updated = await prisma.product.update({ where: { id: productId }, data: data as object, include: { inventory: true } });
  await invalidateVendorCache(vendorId);
  return updated;
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

export async function updateInventory(vendorId: string, productId: string, stock: number) {
  const product = await prisma.product.findFirst({ where: { id: productId, vendorId } });
  if (!product) throw new NotFoundError('Product not found');
  return prisma.inventory.upsert({
    where: { productId },
    create: { productId, stock },
    update: { stock },
  });
}

export async function listVendorOrders(vendorId: string, status?: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const where = { vendorId, ...(status ? { status: status as 'PLACED' } : {}) };
  const [items, total] = await Promise.all([
    prisma.order.findMany({ where, skip, take: limit, include: { items: true, customer: { select: { id: true, name: true, phone: true } } }, orderBy: { createdAt: 'desc' } }),
    prisma.order.count({ where }),
  ]);
  return { items, total, page, limit };
}

export async function updateOrderStatus(vendorId: string, orderId: string, status: string) {
  const order = await prisma.order.findFirst({ where: { id: orderId, vendorId } });
  if (!order) throw new NotFoundError('Order not found');
  return prisma.order.update({
    where: { id: orderId },
    data: { status: status as 'CONFIRMED', ...(status === 'DELIVERED' ? { deliveredAt: new Date() } : {}) },
  });
}

export async function getVendorDashboard(vendorId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [todayOrders, todaySales, lowStock, totalProducts] = await Promise.all([
    prisma.order.count({ where: { vendorId, createdAt: { gte: today }, status: { not: 'CANCELLED' } } }),
    prisma.order.aggregate({ where: { vendorId, createdAt: { gte: today }, status: { not: 'CANCELLED' } }, _sum: { grandTotal: true } }),
    prisma.inventory.findMany({ where: { product: { vendorId }, stock: { lte: 10 } }, include: { product: { select: { name: true } } }, take: 10 }),
    prisma.product.count({ where: { vendorId, status: 'PUBLISHED' } }),
  ]);
  return {
    todayOrders,
    todaySales: todaySales._sum.grandTotal ?? 0,
    lowStock,
    totalProducts,
  };
}

async function invalidateVendorCache(vendorId: string) {
  await cacheDelPattern('home:feed:*');
  await cacheDel(`shop:${vendorId}:products`);
}

export async function assertVendorAccess(userId: string, vendorId: string | null | undefined) {
  if (!vendorId || userId !== vendorId) throw new ForbiddenError('Access denied');
}
