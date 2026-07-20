import { prisma } from '../../lib/prisma.js';
import { cacheGet, cacheSet, cacheDel, cacheDelPattern } from '../../lib/redis.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../../utils/errors.js';
import { randomBytes } from 'crypto';

const memCartCoupons = new Map<string, string>();

async function resolveDistrictId(districtId?: string) {
  if (districtId && districtId !== 'default') return districtId;
  const d = await prisma.district.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'asc' } });
  if (!d) throw new NotFoundError('No district configured — ask admin to create one');
  return d.id;
}

async function getAppSettings() {
  const rows = await prisma.appSetting.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

async function validateCoupon(code: string, customerId: string, subtotal: number) {
  const coupon = await prisma.coupon.findFirst({
    where: { code: code.toUpperCase(), isActive: true },
  });
  if (!coupon) throw new ValidationError('Invalid coupon code');
  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) throw new ValidationError('Coupon not active yet');
  if (coupon.endsAt && coupon.endsAt < now) throw new ValidationError('Coupon expired');
  if (coupon.minOrder && subtotal < Number(coupon.minOrder)) {
    throw new ValidationError(`Minimum order ₹${coupon.minOrder} required for this coupon`);
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    throw new ValidationError('Coupon usage limit reached');
  }
  const userUses = await prisma.customerCoupon.count({ where: { customerId, couponId: coupon.id } });
  if (userUses >= coupon.perUserLimit) throw new ValidationError('You have already used this coupon');

  let discount = 0;
  if (coupon.discountAmt) discount = Number(coupon.discountAmt);
  else if (coupon.discountPct) {
    discount = (subtotal * Number(coupon.discountPct)) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
  }
  return { coupon, discount: Math.min(discount, subtotal) };
}

async function getDeliveryCharge(districtId: string, subtotal: number) {
  const rule = await prisma.deliveryChargeRule.findFirst({
    where: { districtId, isActive: true },
    orderBy: { minDistance: 'asc' },
  });
  if (!rule) return 0;
  if (rule.freeAbove && subtotal >= Number(rule.freeAbove)) return 0;
  return Number(rule.charge);
}

async function getCartCouponCode(customerId: string) {
  const cached = await cacheGet<string>(`cart:coupon:${customerId}`);
  return cached ?? memCartCoupons.get(customerId) ?? null;
}

async function setCartCouponCode(customerId: string, code: string | null) {
  if (code) {
    memCartCoupons.set(customerId, code);
    await cacheSet(`cart:coupon:${customerId}`, code, 3600);
  } else {
    memCartCoupons.delete(customerId);
    await cacheDel(`cart:coupon:${customerId}`);
  }
}

// ─── Home Feed ─────────────────────────────────────────────────────────────────
export async function getHomeFeed(districtIdInput: string, areaId?: string) {
  const districtId = await resolveDistrictId(districtIdInput);  const cacheKey = `home:feed:${districtId}`;
  const cached = await cacheGet<unknown>(cacheKey);
  if (cached) return cached;

  const now = new Date();
  const [banners, microBanners, categories, vendors, trendingProducts, offers, layoutSetting, deliveryRules] = await Promise.all([
    prisma.banner.findMany({ where: { OR: [{ districtId }, { districtId: null }], isActive: true }, orderBy: { sortOrder: 'asc' }, take: 5 }),
    prisma.microBanner.findMany({ where: { OR: [{ districtId }, { districtId: null }], isActive: true }, take: 3 }),
    prisma.category.findMany({ where: { parentId: null, isActive: true }, orderBy: { sortOrder: 'asc' }, take: 12 }),
    prisma.vendor.findMany({
      where: { districtId, status: 'APPROVED', isOpen: true, ...(areaId ? { areaId } : {}) },
      take: 10,
      select: { id: true, shopName: true, slug: true, logoUrl: true, bannerUrl: true, rating: true, minOrderValue: true },
    }),
    prisma.product.findMany({
      where: { status: 'PUBLISHED', vendor: { districtId, status: 'APPROVED' } },
      include: { images: { where: { isPrimary: true }, take: 1 }, vendor: { select: { shopName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 12,
    }),
    prisma.offer.findMany({ where: { isActive: true, OR: [{ districtId }, { districtId: null }] }, take: 5 }),
    prisma.appSetting.findUnique({ where: { key: 'HOME_PAGE_LAYOUT' } }),
    prisma.deliveryChargeRule.findFirst({ where: { OR: [{ districtId }, { districtId: null }], isActive: true } })
  ]);

  const feed = {
    banners, microBanners, categories, nearbyShops: vendors,
    trendingProducts, offers,
    bestSellers: trendingProducts.slice(0, 6),
    recentlyAdded: trendingProducts,
    flashSale: offers.filter((o) => o.endsAt && o.endsAt > now),
    layout: layoutSetting?.value || null,
    deliveryRule: deliveryRules || null,
  };
  await cacheSet(cacheKey, feed, 120);
  return feed;
}

export async function listPublicDistricts() {
  return prisma.district.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
}

export async function listPublicAreas(districtId: string) {
  return prisma.area.findMany({ where: { districtId, isActive: true }, orderBy: { name: 'asc' } });
}

export async function listCategories() {
  return prisma.category.findMany({
    where: { parentId: null, isActive: true },
    include: { children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function listShops(districtIdInput: string, areaId?: string, categoryId?: string) {
  const districtId = await resolveDistrictId(districtIdInput);
  return prisma.vendor.findMany({    where: {
      districtId, status: 'APPROVED',
      ...(areaId ? { areaId } : {}),
      ...(categoryId ? { products: { some: { categoryId, status: 'PUBLISHED' } } } : {}),
    },
    include: { area: true },
    orderBy: { rating: 'desc' },
  });
}

export async function getShop(vendorId: string) {
  const vendor = await prisma.vendor.findFirst({
    where: { id: vendorId, status: 'APPROVED' },
    include: { area: { include: { district: true } } },
  });
  if (!vendor) throw new NotFoundError('Shop not found');
  return vendor;
}

export async function getShopProducts(vendorId: string, categoryId?: string) {
  return prisma.product.findMany({
    where: { vendorId, status: 'PUBLISHED', ...(categoryId ? { categoryId } : {}) },
    include: { images: true, inventory: true, category: true },
    orderBy: { name: 'asc' },
  });
}

export async function getProduct(productId: string) {
  const product = await prisma.product.findFirst({
    where: { id: productId, status: 'PUBLISHED' },
    include: { images: true, inventory: true, category: true, subCategory: true, vendor: { select: { id: true, shopName: true, slug: true } }, reviews: { where: { isVisible: true }, take: 10 } },
  });
  if (!product) throw new NotFoundError('Product not found');
  return product;
}

// ─── Search ────────────────────────────────────────────────────────────────────
export async function search(q: string, districtIdInput?: string, scope?: string, customerId?: string) {
  const query = q.trim();
  if (!query) return { products: [], shops: [], categories: [] };
  const districtId = districtIdInput ? await resolveDistrictId(districtIdInput) : undefined;
  await prisma.searchLog.create({ data: { query, districtId, customerId } });
  const productWhere = {
    status: 'PUBLISHED' as const,
    OR: [
      { name: { contains: query } },
      { brand: { contains: query } },
    ],
    ...(districtId ? { vendor: { districtId } } : {}),
  };

  const [products, shops, categories] = await Promise.all([
    scope === 'shops' ? [] : prisma.product.findMany({ where: productWhere, take: 20, include: { images: { take: 1 }, vendor: { select: { shopName: true } } } }),
    scope === 'products' ? [] : prisma.vendor.findMany({ where: { shopName: { contains: query }, status: 'APPROVED', ...(districtId ? { districtId } : {}) }, take: 10 }),
    scope === 'products' || scope === 'shops' ? [] : prisma.category.findMany({ where: { name: { contains: query } }, take: 5 }),
  ]);
  return { products, shops, categories };
}

export async function getTrendingSearches(districtIdInput?: string) {
  const districtId = districtIdInput ? await resolveDistrictId(districtIdInput) : undefined;
  const since = new Date(Date.now() - 7 * 86400000);
  const logs = await prisma.searchLog.groupBy({
    by: ['query'],
    where: { createdAt: { gte: since }, ...(districtId ? { districtId } : {}) },
    _count: true,
    orderBy: { _count: { query: 'desc' } },
    take: 10,
  });
  return logs.map((l) => ({ query: l.query, count: l._count }));
}

export async function getRecentSearches(customerId: string) {
  const logs = await prisma.searchLog.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    distinct: ['query'],
  });
  return logs.map((l) => l.query);
}

export async function addRecentSearch(customerId: string, query: string) {
  const q = query.trim();
  if (!q) return [];
  await prisma.searchLog.create({ data: { customerId, query: q } });
  return getRecentSearches(customerId);
}

export async function clearRecentSearches(customerId: string) {
  await prisma.searchLog.deleteMany({ where: { customerId } });
}
// ─── Cart ──────────────────────────────────────────────────────────────────────
export async function getCart(customerId: string) {
  const items = await prisma.cartItem.findMany({
    where: { customerId },
    include: { product: { include: { images: { take: 1 }, inventory: true } }, vendor: { select: { id: true, shopName: true, minOrderValue: true, districtId: true } } },
  });
  const subtotal = items.reduce((s, i) => s + Number(i.product.sellingPrice) * i.quantity, 0);
  const couponCode = await getCartCouponCode(customerId);
  let couponPreview: { code: string; discount: number } | null = null;
  if (couponCode && subtotal > 0) {
    try {
      const { coupon, discount } = await validateCoupon(couponCode, customerId, subtotal);
      couponPreview = { code: coupon.code, discount };
    } catch {
      await setCartCouponCode(customerId, null);
    }
  }
  const districtId = items[0]?.vendor?.districtId;
  const deliveryCharge = districtId ? await getDeliveryCharge(districtId, subtotal) : 0;
  const settings = await getAppSettings();
  const taxPercent = Number(settings.taxPercent ?? 0);
  const discount = couponPreview?.discount ?? 0;
  const taxable = Math.max(0, subtotal - discount);
  const tax = (taxable * taxPercent) / 100;
  const grandTotal = taxable + deliveryCharge + tax;

  const byVendor: Record<string, typeof items> = {};
  for (const item of items) {
    if (!byVendor[item.vendorId]) byVendor[item.vendorId] = [];
    byVendor[item.vendorId].push(item);
  }
  return {
    items,
    byVendor: Object.entries(byVendor).map(([vendorId, vendorItems]) => ({ vendorId, vendor: vendorItems[0].vendor, items: vendorItems })),
    summary: { subtotal, discount, deliveryCharge, tax, taxPercent, grandTotal, couponCode: couponPreview?.code ?? null },
  };
}
export async function addToCart(customerId: string, productId: string, quantity = 1) {
  const product = await prisma.product.findFirst({ where: { id: productId, status: 'PUBLISHED' }, include: { inventory: true } });
  if (!product) throw new NotFoundError('Product not found');
  if (!product.inventory || product.inventory.stock < quantity) throw new ValidationError('Insufficient stock');
  return prisma.cartItem.upsert({
    where: { customerId_productId: { customerId, productId } },
    create: { customerId, productId, vendorId: product.vendorId, quantity },
    update: { quantity: { increment: quantity } },
    include: { product: true },
  });
}

export async function updateCartItem(customerId: string, productId: string, quantity: number) {
  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({ where: { customerId, productId } });
    return { deleted: true };
  }
  const product = await prisma.product.findFirst({ where: { id: productId }, include: { inventory: true } });
  if (!product?.inventory || product.inventory.stock < quantity) throw new ValidationError('Insufficient stock');
  return prisma.cartItem.update({ where: { customerId_productId: { customerId, productId } }, data: { quantity } });
}

export async function removeFromCart(customerId: string, productId: string) {
  await prisma.cartItem.deleteMany({ where: { customerId, productId } });
}

export async function applyCartCoupon(customerId: string, code: string) {
  const cartItems = await prisma.cartItem.findMany({ where: { customerId }, include: { product: true } });
  if (cartItems.length === 0) throw new ValidationError('Cart is empty');
  const subtotal = cartItems.reduce((s, i) => s + Number(i.product.sellingPrice) * i.quantity, 0);
  const { coupon, discount } = await validateCoupon(code, customerId, subtotal);
  await setCartCouponCode(customerId, coupon.code);
  return { code: coupon.code, discount, message: `Coupon applied — you save ₹${discount.toFixed(0)}` };
}

export async function removeCartCoupon(customerId: string) {
  await setCartCouponCode(customerId, null);
  return { removed: true };
}

// ─── Checkout (split orders per vendor) ────────────────────────────────────────
export async function checkout(customerId: string, addressId: string, paymentMethod: 'COD' | 'RAZORPAY' = 'COD', couponCode?: string) {  const address = await prisma.address.findFirst({ where: { id: addressId, customerId } });
  if (!address) throw new NotFoundError('Address not found');

  const cartItems = await prisma.cartItem.findMany({
    where: { customerId },
    include: { product: { include: { inventory: true } }, vendor: true },
  });
  if (cartItems.length === 0) throw new ValidationError('Cart is empty');

  for (const item of cartItems) {
    if (!item.product.inventory || item.product.inventory.stock < item.quantity) {
      throw new ValidationError(`Insufficient stock for ${item.product.name}`);
    }
  }

  const byVendor = new Map<string, typeof cartItems>();
  for (const item of cartItems) {
    const list = byVendor.get(item.vendorId) ?? [];
    list.push(item);
    byVendor.set(item.vendorId, list);
  }

  const cartSubtotal = cartItems.reduce((s, i) => s + Number(i.product.sellingPrice) * i.quantity, 0);
  const appliedCode = couponCode ?? (await getCartCouponCode(customerId)) ?? undefined;
  let totalDiscount = 0;
  let couponRecord: { id: string; code: string } | null = null;
  if (appliedCode) {
    const validated = await validateCoupon(appliedCode, customerId, cartSubtotal);
    totalDiscount = validated.discount;
    couponRecord = { id: validated.coupon.id, code: validated.coupon.code };
  }

  const districtId = cartItems[0].vendor.districtId;
  const deliveryChargeTotal = await getDeliveryCharge(districtId, cartSubtotal);
  const settings = await getAppSettings();
  const taxPercent = Number(settings.taxPercent ?? 0);
  const taxable = Math.max(0, cartSubtotal - totalDiscount);
  const taxTotal = (taxable * taxPercent) / 100;
  const grandTotalAll = taxable + deliveryChargeTotal + taxTotal;

  const paymentRef = `pay_${randomBytes(8).toString('hex')}`;

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        reference: paymentRef,
        customerId,
        amount: grandTotalAll,
        method: paymentMethod,
        status: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
      },
    });

    const orders = [];
    let vendorIndex = 0;
    const vendorCount = byVendor.size;

    for (const [vendorId, items] of byVendor) {
      const subtotal = items.reduce((s, i) => s + Number(i.product.sellingPrice) * i.quantity, 0);
      const share = cartSubtotal > 0 ? subtotal / cartSubtotal : 1 / vendorCount;
      const discount = totalDiscount * share;
      const deliveryCharge = deliveryChargeTotal * share;
      const tax = taxTotal * share;
      const grandTotal = subtotal - discount + deliveryCharge + tax;
      const orderNumber = `ORD-${Date.now()}-${randomBytes(3).toString('hex')}`;
      vendorIndex++;

      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          vendorId,
          addressId,
          paymentId: payment.id,
          subtotal,
          discount,
          deliveryCharge,
          tax,
          grandTotal,
          couponCode: couponRecord?.code,
          status: 'PLACED',
          items: {
            create: items.map((i) => ({
              productId: i.productId,
              name: i.product.name,
              quantity: i.quantity,
              unitPrice: i.product.sellingPrice,
              total: Number(i.product.sellingPrice) * i.quantity,
            })),
          },
        },
        include: { items: true, vendor: { select: { shopName: true } } },
      });

      for (const item of items) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.notification.create({
        data: {
          vendorId,
          type: 'ORDER',
          title: 'New order received',
          body: `Order ${orderNumber} — ₹${Number(grandTotal).toFixed(0)}`,
          data: { orderId: order.id },
        },
      });

      orders.push(order);
    }

    if (couponRecord) {
      await tx.coupon.update({ where: { id: couponRecord.id }, data: { usedCount: { increment: 1 } } });
      await tx.customerCoupon.create({ data: { customerId, couponId: couponRecord.id } });
    }

    await tx.cartItem.deleteMany({ where: { customerId } });
    await setCartCouponCode(customerId, null);
    return { payment, orders, summary: { subtotal: cartSubtotal, discount: totalDiscount, deliveryCharge: deliveryChargeTotal, tax: taxTotal, grandTotal: grandTotalAll } };
  });

  await cacheDelPattern('home:feed:*');
  return result;
}
// ─── Orders ────────────────────────────────────────────────────────────────────
export async function listCustomerOrders(customerId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.order.findMany({ where: { customerId }, skip, take: limit, include: { vendor: { select: { shopName: true } }, items: true }, orderBy: { createdAt: 'desc' } }),
    prisma.order.count({ where: { customerId } }),
  ]);
  return { items, total, page, limit };
}

export async function getOrder(customerId: string, orderId: string) {
  const order = await prisma.order.findFirst({ where: { id: orderId, customerId }, include: { items: true, vendor: true, address: true } });
  if (!order) throw new NotFoundError('Order not found');
  return order;
}

export async function cancelOrder(customerId: string, orderId: string, reason?: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, customerId, status: { in: ['PLACED', 'CONFIRMED'] } },
    include: { items: true },
  });
  if (!order) throw new ValidationError('Order cannot be cancelled');

  return prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.inventory.update({
        where: { productId: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
    return tx.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: reason },
    });
  });
}
// ─── Profile & Addresses ───────────────────────────────────────────────────────
export async function getProfile(customerId: string) {
  return prisma.customer.findUnique({ where: { id: customerId }, include: { addresses: true, wallet: true } });
}

export async function updateProfile(customerId: string, data: { name?: string; email?: string }) {
  return prisma.customer.update({ where: { id: customerId }, data });
}

export async function listAddresses(customerId: string) {
  return prisma.address.findMany({ where: { customerId } });
}

export async function createAddress(customerId: string, data: Record<string, unknown>) {
  return prisma.address.create({ data: { ...data, customerId } as Parameters<typeof prisma.address.create>[0]['data'] });
}

export async function updateAddress(customerId: string, addressId: string, data: Record<string, unknown>) {
  const existing = await prisma.address.findFirst({ where: { id: addressId, customerId } });
  if (!existing) throw new NotFoundError('Address not found');
  if (data.isDefault) {
    await prisma.address.updateMany({ where: { customerId }, data: { isDefault: false } });
  }
  return prisma.address.update({ where: { id: addressId }, data: data as Parameters<typeof prisma.address.update>[0]['data'] });
}

export async function deleteAddress(customerId: string, addressId: string) {
  const existing = await prisma.address.findFirst({ where: { id: addressId, customerId } });
  if (!existing) throw new NotFoundError('Address not found');
  await prisma.address.delete({ where: { id: addressId } });
}
// ─── Wishlist ──────────────────────────────────────────────────────────────────
export async function getWishlist(customerId: string) {
  return prisma.wishlist.findMany({ where: { customerId }, include: { product: { include: { images: { take: 1 } } } } });
}

export async function addWishlist(customerId: string, productId: string) {
  return prisma.wishlist.upsert({ where: { customerId_productId: { customerId, productId } }, create: { customerId, productId }, update: {} });
}

export async function removeWishlist(customerId: string, productId: string) {
  await prisma.wishlist.deleteMany({ where: { customerId, productId } });
}

// ─── Reviews ───────────────────────────────────────────────────────────────────
export async function createReview(customerId: string, orderId: string, rating: number, comment?: string, productId?: string) {
  const order = await prisma.order.findFirst({ where: { id: orderId, customerId, status: 'DELIVERED' } });
  if (!order) throw new ValidationError('Can only review delivered orders');
  const existing = await prisma.review.findFirst({ where: { orderId, customerId } });
  if (existing) throw new ValidationError('Already reviewed');
  return prisma.review.create({ data: { customerId, orderId, rating, comment, productId, vendorId: order.vendorId } });
}

// ─── Notifications ─────────────────────────────────────────────────────────────
export async function getNotifications(customerId: string) {
  return prisma.notification.findMany({ where: { customerId }, orderBy: { createdAt: 'desc' }, take: 50 });
}

export async function markNotificationRead(customerId: string, id: string) {
  return prisma.notification.updateMany({ where: { id, customerId }, data: { isRead: true } });
}

// ─── Support ───────────────────────────────────────────────────────────────────
export async function createTicket(customerId: string, subject: string, message: string, orderId?: string) {
  return prisma.supportTicket.create({ data: { customerId, subject, message, orderId } });
}

export async function listTickets(customerId: string) {
  return prisma.supportTicket.findMany({ where: { customerId }, orderBy: { createdAt: 'desc' } });
}

export async function getCustomerCoupons(customerId: string) {
  const coupons = await prisma.coupon.findMany({ where: { isActive: true }, take: 20 });
  const used = await prisma.customerCoupon.findMany({ where: { customerId }, select: { couponId: true } });
  const usedIds = new Set(used.map((u) => u.couponId));
  return coupons.map((c) => ({ ...c, alreadyUsed: usedIds.has(c.id) }));
}
// ─── Wallet ────────────────────────────────────────────────────────────────────
export async function getWallet(customerId: string) {
  const wallet = await prisma.wallet.findUnique({ where: { customerId }, include: { transactions: { orderBy: { createdAt: 'desc' }, take: 20 } } });
  return wallet ?? { balance: 0, transactions: [] };
}

// ─── Static pages ──────────────────────────────────────────────────────────────
export async function getStaticPage(slug: string) {
  const page = await prisma.staticPage.findUnique({ where: { slug, isActive: true } });
  if (!page) throw new NotFoundError('Page not found');
  return page;
}

// ─── Payment webhook (Razorpay stub) ─────────────────────────────────────────────
export async function handlePaymentWebhook(payload: { reference?: string; razorpayPayId?: string; status?: string }) {
  const { reference, razorpayPayId, status } = payload;
  if (!reference) throw new ValidationError('Missing payment reference');
  const payment = await prisma.payment.findUnique({ where: { reference } });
  if (!payment) throw new NotFoundError('Payment not found');
  if (payment.status === 'PAID') return payment;
  return prisma.payment.update({
    where: { reference },
    data: {
      status: status === 'failed' ? 'FAILED' : 'PAID',
      razorpayPayId: razorpayPayId ?? payment.razorpayPayId,
    },
  });
}
