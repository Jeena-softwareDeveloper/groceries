import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth.service.js';
import { sendSuccess } from '../../utils/response.js';
import { paramId } from '../../utils/params.js';
import * as svc from './customer.service.js';
import { vendorRequestCustomerRoutes } from '../vendor-request/vendor-request.customer.routes.js';


export const customerRoutes = Router();

// Public routes
customerRoutes.get('/home/feed', async (req, res, next) => {
  try {
    sendSuccess(res, await svc.getHomeFeed(req.query.districtId as string, req.query.areaId as string));
  } catch (e) { next(e); }
});
customerRoutes.get('/districts', async (_req, res, next) => {
  try { sendSuccess(res, await svc.listPublicDistricts()); } catch (e) { next(e); }
});
customerRoutes.get('/areas', async (req, res, next) => {
  try {
    const districtId = req.query.districtId as string;
    if (!districtId) {
      sendSuccess(res, []);
      return;
    }
    sendSuccess(res, await svc.listPublicAreas(districtId));
  } catch (e) { next(e); }
});
customerRoutes.get('/categories', async (_req, res, next) => {
  try { sendSuccess(res, await svc.listCategories()); } catch (e) { next(e); }
});
customerRoutes.get('/shops', async (req, res, next) => {
  try {
    sendSuccess(res, await svc.listShops(req.query.districtId as string, req.query.areaId as string, req.query.categoryId as string));
  } catch (e) { next(e); }
});
customerRoutes.get('/shops/:id', async (req, res, next) => {
  try { sendSuccess(res, await svc.getShop(paramId(req))); } catch (e) { next(e); }
});
customerRoutes.get('/shops/:id/products', async (req, res, next) => {
  try { sendSuccess(res, await svc.getShopProducts(paramId(req), req.query.categoryId as string)); } catch (e) { next(e); }
});
customerRoutes.get('/products/:id', async (req, res, next) => {
  try { sendSuccess(res, await svc.getProduct(paramId(req))); } catch (e) { next(e); }
});
customerRoutes.get('/search', async (req, res, next) => {
  try {
    const customerId = req.user?.role === 'CUSTOMER' ? req.user.sub : undefined;
    sendSuccess(res, await svc.search(req.query.q as string, req.query.districtId as string, req.query.scope as string, customerId));
  } catch (e) { next(e); }
});
customerRoutes.get('/search/trending', async (req, res, next) => {
  try { sendSuccess(res, await svc.getTrendingSearches(req.query.districtId as string)); } catch (e) { next(e); }
});
customerRoutes.get('/pages/:slug', async (req, res, next) => {
  try { sendSuccess(res, await svc.getStaticPage(req.params.slug)); } catch (e) { next(e); }
});

// Protected routes
const auth = [authenticate, authorize('CUSTOMER')] as const;
customerRoutes.get('/cart', ...auth, async (req, res, next) => {
  try { sendSuccess(res, await svc.getCart(req.user!.sub)); } catch (e) { next(e); }
});
customerRoutes.post('/cart', ...auth, async (req, res, next) => {
  try { sendSuccess(res, await svc.addToCart(req.user!.sub, req.body.productId, req.body.quantity), 201); } catch (e) { next(e); }
});
customerRoutes.put('/cart/:productId', ...auth, async (req, res, next) => {
  try { sendSuccess(res, await svc.updateCartItem(req.user!.sub, paramId(req, 'productId'), req.body.quantity)); } catch (e) { next(e); }
});
customerRoutes.delete('/cart/:productId', ...auth, async (req, res, next) => {
  try { await svc.removeFromCart(req.user!.sub, paramId(req, 'productId')); sendSuccess(res, { deleted: true }); } catch (e) { next(e); }
});
customerRoutes.post('/cart/coupon', ...auth, async (req, res, next) => {
  try { sendSuccess(res, await svc.applyCartCoupon(req.user!.sub, req.body.code)); } catch (e) { next(e); }
});
customerRoutes.delete('/cart/coupon', ...auth, async (req, res, next) => {
  try { sendSuccess(res, await svc.removeCartCoupon(req.user!.sub)); } catch (e) { next(e); }
});
customerRoutes.post('/checkout', ...auth, async (req, res, next) => {
  try { sendSuccess(res, await svc.checkout(req.user!.sub, req.body.addressId, req.body.paymentMethod, req.body.couponCode), 201); } catch (e) { next(e); }
});
customerRoutes.get('/orders', ...auth, async (req, res, next) => {
  try {
    const r = await svc.listCustomerOrders(req.user!.sub, Number(req.query.page) || 1);
    sendSuccess(res, r.items, 200, { page: r.page, limit: r.limit, total: r.total });
  } catch (e) { next(e); }
});
customerRoutes.get('/orders/:id', ...auth, async (req, res, next) => {
  try { sendSuccess(res, await svc.getOrder(req.user!.sub, paramId(req))); } catch (e) { next(e); }
});
customerRoutes.post('/orders/:id/cancel', ...auth, async (req, res, next) => {
  try { sendSuccess(res, await svc.cancelOrder(req.user!.sub, paramId(req), req.body.reason)); } catch (e) { next(e); }
});
customerRoutes.get('/profile', ...auth, async (req, res, next) => {
  try { sendSuccess(res, await svc.getProfile(req.user!.sub)); } catch (e) { next(e); }
});
customerRoutes.put('/profile', ...auth, async (req, res, next) => {
  try { sendSuccess(res, await svc.updateProfile(req.user!.sub, req.body)); } catch (e) { next(e); }
});
customerRoutes.get('/addresses', ...auth, async (req, res, next) => {
  try { sendSuccess(res, await svc.listAddresses(req.user!.sub)); } catch (e) { next(e); }
});
customerRoutes.post('/addresses', ...auth, async (req, res, next) => {
  try { sendSuccess(res, await svc.createAddress(req.user!.sub, req.body), 201); } catch (e) { next(e); }
});
customerRoutes.put('/addresses/:id', ...auth, async (req, res, next) => {
  try { sendSuccess(res, await svc.updateAddress(req.user!.sub, paramId(req), req.body)); } catch (e) { next(e); }
});
customerRoutes.delete('/addresses/:id', ...auth, async (req, res, next) => {
  try { await svc.deleteAddress(req.user!.sub, paramId(req)); sendSuccess(res, { deleted: true }); } catch (e) { next(e); }
});
customerRoutes.get('/coupons', ...auth, async (req, res, next) => {
  try { sendSuccess(res, await svc.getCustomerCoupons(req.user!.sub)); } catch (e) { next(e); }
});
customerRoutes.get('/wishlist', ...auth, async (req, res, next) => {
  try { sendSuccess(res, await svc.getWishlist(req.user!.sub)); } catch (e) { next(e); }
});
customerRoutes.post('/wishlist', ...auth, async (req, res, next) => {
  try { sendSuccess(res, await svc.addWishlist(req.user!.sub, req.body.productId), 201); } catch (e) { next(e); }
});
customerRoutes.delete('/wishlist/:productId', ...auth, async (req, res, next) => {
  try { await svc.removeWishlist(req.user!.sub, paramId(req, 'productId')); sendSuccess(res, { deleted: true }); } catch (e) { next(e); }
});
customerRoutes.post('/reviews', ...auth, async (req, res, next) => {
  try { sendSuccess(res, await svc.createReview(req.user!.sub, req.body.orderId, req.body.rating, req.body.comment, req.body.productId), 201); } catch (e) { next(e); }
});
customerRoutes.get('/notifications', ...auth, async (req, res, next) => {
  try { sendSuccess(res, await svc.getNotifications(req.user!.sub)); } catch (e) { next(e); }
});
customerRoutes.patch('/notifications/:id/read', ...auth, async (req, res, next) => {
  try { await svc.markNotificationRead(req.user!.sub, paramId(req)); sendSuccess(res, { read: true }); } catch (e) { next(e); }
});
customerRoutes.get('/wallet', ...auth, async (req, res, next) => {
  try { sendSuccess(res, await svc.getWallet(req.user!.sub)); } catch (e) { next(e); }
});
customerRoutes.post('/support/tickets', ...auth, async (req, res, next) => {
  try { sendSuccess(res, await svc.createTicket(req.user!.sub, req.body.subject, req.body.message, req.body.orderId), 201); } catch (e) { next(e); }
});
customerRoutes.get('/support/tickets', ...auth, async (req, res, next) => {
  try { sendSuccess(res, await svc.listTickets(req.user!.sub)); } catch (e) { next(e); }
});
customerRoutes.get('/search/recent', ...auth, async (req, res, next) => {
  try { sendSuccess(res, await svc.getRecentSearches(req.user!.sub)); } catch (e) { next(e); }
});
customerRoutes.post('/search/recent', ...auth, async (req, res, next) => {
  try { sendSuccess(res, await svc.addRecentSearch(req.user!.sub, req.body.query)); } catch (e) { next(e); }
});
customerRoutes.delete('/search/recent', ...auth, async (req, res, next) => {
  try { await svc.clearRecentSearches(req.user!.sub); sendSuccess(res, { cleared: true }); } catch (e) { next(e); }
});

// Razorpay webhook (public — verify signature in production)
customerRoutes.post('/payment/webhook', async (req, res, next) => {
  try { sendSuccess(res, await svc.handlePaymentWebhook(req.body)); } catch (e) { next(e); }
});

// Vendor onboarding request
customerRoutes.use('/vendor-request', vendorRequestCustomerRoutes);

