import axios from 'axios';
import type { ApiResponse } from '@shared/types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3000';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export type { ApiResponse };

export function getDistrictId(): string {
  return localStorage.getItem('districtId') ?? '';
}

export function getAreaId(): string | null {
  return localStorage.getItem('areaId');
}

export function setLocation(districtId: string, areaId?: string, districtName?: string, areaName?: string) {
  localStorage.setItem('districtId', districtId);
  if (areaId) localStorage.setItem('areaId', areaId);
  if (districtName) localStorage.setItem('districtName', districtName);
  if (areaName) localStorage.setItem('areaName', areaName);
}

export async function listDistricts() {
  const res = await api.get<ApiResponse<Array<{ id: string; name: string }>>>('/customer/districts');
  return res.data.data ?? [];
}

export async function listAreas(districtId: string) {
  const res = await api.get<ApiResponse<Array<{ id: string; name: string }>>>('/customer/areas', { params: { districtId } });
  return res.data.data ?? [];
}

export async function searchProducts(q: string, districtId?: string) {
  const res = await api.get<ApiResponse<{ products: ProductSummary[]; shops: ShopSummary[]; categories: Category[] }>>('/customer/search', {
    params: { q, districtId: (districtId ?? getDistrictId()) || undefined },
  });
  return res.data.data!;
}

export async function getTrendingSearches(districtId?: string) {
  const res = await api.get<ApiResponse<Array<{ query: string; count: number }>>>('/customer/search/trending', {
    params: { districtId: (districtId ?? getDistrictId()) || undefined },
  });
  return res.data.data ?? [];
}

export async function applyCartCoupon(code: string) {
  const res = await api.post<ApiResponse<{ code: string; discount: number; message: string }>>('/customer/cart/coupon', { code });
  return res.data.data!;
}

export async function removeCartCoupon() {
  await api.delete('/customer/cart/coupon');
}

export async function fetchWishlist() {
  const res = await api.get<ApiResponse<Array<{ id: string; product: ProductSummary }>>>('/customer/wishlist');
  return res.data.data ?? [];
}

export async function addToWishlist(productId: string) {
  await api.post('/customer/wishlist', { productId });
}

export async function removeFromWishlist(productId: string) {
  await api.delete(`/customer/wishlist/${productId}`);
}

export async function fetchNotifications() {
  const res = await api.get<ApiResponse<Array<{ id: string; title: string; body: string; isRead: boolean }>>>('/customer/notifications');
  return res.data.data ?? [];
}

export async function fetchWallet() {
  const res = await api.get<ApiResponse<{ balance: number; transactions: Array<{ id: string; amount: number; type: string }> }>>('/customer/wallet');
  return res.data.data!;
}

export async function createSupportTicket(subject: string, message: string) {
  const res = await api.post('/customer/support/tickets', { subject, message });
  return res.data.data;
}

export async function listSupportTickets() {
  const res = await api.get<ApiResponse<Array<{ id: string; subject: string; status: string }>>>('/customer/support/tickets');
  return res.data.data ?? [];
}

export async function cancelOrder(id: string, reason?: string) {
  const res = await api.post<ApiResponse<unknown>>(`/customer/orders/${id}/cancel`, { reason });
  return res.data.data;
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

export async function requestOtp(phone: string) {
  const res = await api.post<ApiResponse<{ message: string; otp?: string }>>(
    '/auth/customer/otp/request',
    { phone },
  );
  return res.data.data!;
}

export async function verifyOtp(phone: string, otp: string) {
  const res = await api.post<ApiResponse<{ accessToken: string; refreshToken: string; role: string }>>(
    '/auth/customer/otp/verify',
    { phone, otp },
  );
  return res.data.data!;
}

export async function getMe() {
  const res = await api.get<ApiResponse<CustomerProfile>>('/auth/me');
  return res.data.data!;
}

export async function logoutApi() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) await api.post('/auth/logout', { refreshToken }).catch(() => {});
}

// ─── Customer API ──────────────────────────────────────────────────────────────

export interface CustomerProfile {
  id: string;
  phone: string;
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  role?: string;
}

export interface HomeFeed {
  banners: Banner[];
  microBanners: MicroBanner[];
  categories: Category[];
  nearbyShops: ShopSummary[];
  trendingProducts: ProductSummary[];
  offers: Offer[];
  bestSellers: ProductSummary[];
  recentlyAdded: ProductSummary[];
  flashSale: Offer[];
}

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string | null;
}

export interface MicroBanner {
  id: string;
  title: string;
  imageUrl: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
}

export interface ShopSummary {
  id: string;
  shopName: string;
  slug: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  rating: number;
  minOrderValue: number | string;
}

export interface Shop extends ShopSummary {
  description?: string | null;
  address: string;
  phone: string;
  isOpen: boolean;
  area?: { name: string; district?: { name: string } };
}

export interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  sellingPrice: number | string;
  mrp?: number | string;
  unit: string;
  images?: ProductImage[];
  vendor?: { shopName: string; id?: string };
  inventory?: { stock: number };
}

export interface Product extends ProductSummary {
  description?: string | null;
  brand?: string | null;
  category?: Category;
  subCategory?: Category;
  vendor?: { id: string; shopName: string; slug: string };
  reviews?: Review[];
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export interface Offer {
  id: string;
  title: string;
  description?: string | null;
  discountType: string;
  discountValue: number | string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: ProductSummary;
  vendor: { id: string; shopName: string; minOrderValue: number | string };
}

export interface Cart {
  items: CartItem[];
  byVendor: { vendorId: string; vendor: CartItem['vendor']; items: CartItem[] }[];
}

export interface Address {
  id: string;
  label: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  grandTotal: number | string;
  subtotal: number | string;
  createdAt: string;
  vendor?: { shopName: string };
  items?: OrderItem[];
  address?: Address;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number | string;
  total: number | string;
}

export async function getHomeFeed(districtId?: string, areaId?: string) {
  const res = await api.get<ApiResponse<HomeFeed>>('/customer/home/feed', {
    params: { districtId: (districtId ?? getDistrictId()) || undefined, areaId: areaId ?? getAreaId() ?? undefined },
  });
  return res.data.data!;
}

export async function listShops(districtId?: string, areaId?: string, categoryId?: string) {
  const res = await api.get<ApiResponse<Shop[]>>('/customer/shops', {
    params: { districtId: districtId ?? getDistrictId(), areaId, categoryId },
  });
  return res.data.data!;
}

export async function getShop(id: string) {
  const res = await api.get<ApiResponse<Shop>>(`/customer/shops/${id}`);
  return res.data.data!;
}

export async function getShopProducts(shopId: string, categoryId?: string) {
  const res = await api.get<ApiResponse<ProductSummary[]>>(`/customer/shops/${shopId}/products`, {
    params: { categoryId },
  });
  return res.data.data!;
}

export async function getProduct(id: string) {
  const res = await api.get<ApiResponse<Product>>(`/customer/products/${id}`);
  return res.data.data!;
}

export async function getCart() {
  const res = await api.get<ApiResponse<Cart>>('/customer/cart');
  return res.data.data!;
}

export async function addToCart(productId: string, quantity = 1) {
  const res = await api.post<ApiResponse<CartItem>>('/customer/cart', { productId, quantity });
  return res.data.data!;
}

export async function updateCartItem(productId: string, quantity: number) {
  const res = await api.put<ApiResponse<unknown>>(`/customer/cart/${productId}`, { quantity });
  return res.data.data;
}

export async function removeFromCart(productId: string) {
  await api.delete(`/customer/cart/${productId}`);
}

export async function checkout(addressId: string, paymentMethod: 'COD' | 'RAZORPAY' = 'COD', couponCode?: string) {
  const res = await api.post<ApiResponse<{ payment: unknown; orders: Order[] }>>('/customer/checkout', {
    addressId,
    paymentMethod,
    couponCode,
  });
  return res.data.data!;
}

export async function listOrders(page = 1) {
  const res = await api.get<ApiResponse<Order[]>>('/customer/orders', { params: { page } });
  return { orders: res.data.data ?? [], meta: res.data.meta };
}

export async function getOrder(id: string) {
  const res = await api.get<ApiResponse<Order>>(`/customer/orders/${id}`);
  return res.data.data!;
}

export async function getProfile() {
  const res = await api.get<ApiResponse<CustomerProfile & { addresses?: Address[] }>>('/customer/profile');
  return res.data.data!;
}

export async function updateProfile(data: { name?: string; email?: string }) {
  const res = await api.put<ApiResponse<CustomerProfile>>('/customer/profile', data);
  return res.data.data!;
}

export async function listAddresses() {
  const res = await api.get<ApiResponse<Address[]>>('/customer/addresses');
  return res.data.data ?? [];
}

export async function createAddress(data: Omit<Address, 'id'>) {
  const res = await api.post<ApiResponse<Address>>('/customer/addresses', data);
  return res.data.data!;
}

export function formatPrice(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `₹${num.toFixed(2)}`;
}
