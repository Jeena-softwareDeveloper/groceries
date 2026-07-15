import { api, getDistrictId, getAreaId } from './client';
import { ENDPOINTS } from './endpoints';
import type { ApiResponse } from './client';
import type { ProductSummary, Category, ShopSummary, Offer, Banner, MicroBanner } from './product.api';

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

import type { CustomerProfile } from './auth.api';

export const customerApi = {
  getHomeFeed: async (districtId?: string, areaId?: string) => {
    const res = await api.get<ApiResponse<HomeFeed>>(ENDPOINTS.CUSTOMER.HOME_FEED, {
      params: { districtId: (districtId ?? getDistrictId()) || undefined, areaId: areaId ?? getAreaId() ?? undefined },
    });
    return res.data.data!;
  },

  getProfile: async () => {
    const res = await api.get<ApiResponse<CustomerProfile & { addresses?: Address[] }>>(ENDPOINTS.CUSTOMER.PROFILE);
    return res.data.data!;
  },

  updateProfile: async (data: { name?: string; email?: string }) => {
    const res = await api.put<ApiResponse<CustomerProfile>>(ENDPOINTS.CUSTOMER.PROFILE, data);
    return res.data.data!;
  },

  listAddresses: async () => {
    const res = await api.get<ApiResponse<Address[]>>(ENDPOINTS.CUSTOMER.ADDRESSES);
    return res.data.data ?? [];
  },

  createAddress: async (data: Omit<Address, 'id'>) => {
    const res = await api.post<ApiResponse<Address>>(ENDPOINTS.CUSTOMER.ADDRESSES, data);
    return res.data.data!;
  },

  fetchWishlist: async () => {
    const res = await api.get<ApiResponse<Array<{ id: string; product: ProductSummary }>>>(ENDPOINTS.CUSTOMER.WISHLIST.BASE);
    return res.data.data ?? [];
  },

  addToWishlist: async (productId: string) => {
    await api.post(ENDPOINTS.CUSTOMER.WISHLIST.BASE, { productId });
  },

  removeFromWishlist: async (productId: string) => {
    await api.delete(ENDPOINTS.CUSTOMER.WISHLIST.BY_ID(productId));
  },

  createSupportTicket: async (subject: string, message: string) => {
    const res = await api.post(ENDPOINTS.CUSTOMER.SUPPORT, { subject, message });
    return res.data.data;
  },

  listSupportTickets: async () => {
    const res = await api.get<ApiResponse<Array<{ id: string; subject: string; status: string }>>>(ENDPOINTS.CUSTOMER.SUPPORT);
    return res.data.data ?? [];
  },

  listDistricts: async () => {
    const res = await api.get<ApiResponse<Array<{ id: string; name: string }>>>(ENDPOINTS.CUSTOMER.DISTRICTS);
    return res.data.data ?? [];
  },

  listAreas: async (districtId: string) => {
    const res = await api.get<ApiResponse<Array<{ id: string; name: string }>>>(ENDPOINTS.CUSTOMER.AREAS, { params: { districtId } });
    return res.data.data ?? [];
  }
};
