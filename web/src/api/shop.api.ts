import { api, getDistrictId } from './client';
import { ENDPOINTS } from './endpoints';
import type { ApiResponse } from './client';
import type { ShopSummary, ProductSummary } from './product.api';

export interface Shop extends ShopSummary {
  description?: string | null;
  address: string;
  phone: string;
  isOpen: boolean;
  area?: { name: string; district?: { name: string } };
}

export const shopApi = {
  listShops: async (districtId?: string, areaId?: string, categoryId?: string) => {
    const res = await api.get<ApiResponse<Shop[]>>(ENDPOINTS.CUSTOMER.SHOPS.BASE, {
      params: { districtId: districtId ?? getDistrictId(), areaId, categoryId },
    });
    return res.data.data!;
  },

  getShop: async (id: string) => {
    const res = await api.get<ApiResponse<Shop>>(ENDPOINTS.CUSTOMER.SHOPS.BY_ID(id));
    return res.data.data!;
  },

  getShopProducts: async (shopId: string, categoryId?: string) => {
    const res = await api.get<ApiResponse<ProductSummary[]>>(ENDPOINTS.CUSTOMER.SHOPS.PRODUCTS(shopId), {
      params: { categoryId },
    });
    return res.data.data!;
  }
};
