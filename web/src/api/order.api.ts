import { api } from './client';
import { ENDPOINTS } from './endpoints';
import type { ApiResponse } from './client';
import type { Address } from './customer.api';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number | string;
  total: number | string;
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

export const orderApi = {
  checkout: async (addressId: string, paymentMethod: 'COD' | 'RAZORPAY' = 'COD', couponCode?: string) => {
    const res = await api.post<ApiResponse<{ payment: unknown; orders: Order[] }>>(ENDPOINTS.CUSTOMER.CHECKOUT, {
      addressId,
      paymentMethod,
      couponCode,
    });
    return res.data.data!;
  },

  listOrders: async (page = 1) => {
    const res = await api.get<ApiResponse<Order[]>>(ENDPOINTS.CUSTOMER.ORDERS.BASE, { params: { page } });
    return { orders: res.data.data ?? [], meta: res.data.meta };
  },

  getOrder: async (id: string) => {
    const res = await api.get<ApiResponse<Order>>(ENDPOINTS.CUSTOMER.ORDERS.BY_ID(id));
    return res.data.data!;
  },

  cancelOrder: async (id: string, reason?: string) => {
    const res = await api.post<ApiResponse<unknown>>(ENDPOINTS.CUSTOMER.ORDERS.CANCEL(id), { reason });
    return res.data.data;
  }
};
