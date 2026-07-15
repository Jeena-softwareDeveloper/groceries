import { api } from './client';
import { ENDPOINTS } from './endpoints';
import type { ApiResponse } from './client';
import type { ProductSummary } from './product.api';
import type { Order } from './order.api';

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

export const cartApi = {
  getCart: async () => {
    const res = await api.get<ApiResponse<Cart>>(ENDPOINTS.CUSTOMER.CART.BASE);
    return res.data.data!;
  },

  addToCart: async (productId: string, quantity = 1) => {
    const res = await api.post<ApiResponse<CartItem>>(ENDPOINTS.CUSTOMER.CART.BASE, { productId, quantity });
    return res.data.data!;
  },

  updateCartItem: async (productId: string, quantity: number) => {
    const res = await api.put<ApiResponse<unknown>>(ENDPOINTS.CUSTOMER.CART.BY_ID(productId), { quantity });
    return res.data.data;
  },

  removeFromCart: async (productId: string) => {
    await api.delete(ENDPOINTS.CUSTOMER.CART.BY_ID(productId));
  },

  applyCartCoupon: async (code: string) => {
    const res = await api.post<ApiResponse<{ code: string; discount: number; message: string }>>(ENDPOINTS.CUSTOMER.CART.COUPON, { code });
    return res.data.data!;
  },

  removeCartCoupon: async () => {
    await api.delete(ENDPOINTS.CUSTOMER.CART.COUPON);
  }
};
