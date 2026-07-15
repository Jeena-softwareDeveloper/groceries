import { api, getDistrictId } from './client';
import { ENDPOINTS } from './endpoints';
import type { ApiResponse } from './client';

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

export interface Offer {
  id: string;
  title: string;
  description?: string | null;
  discountType: string;
  discountValue: number | string;
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

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export interface Product extends ProductSummary {
  description?: string | null;
  brand?: string | null;
  category?: Category;
  subCategory?: Category;
  vendor?: { id: string; shopName: string; slug: string };
  reviews?: Review[];
}

export const productApi = {
  getProduct: async (id: string) => {
    const res = await api.get<ApiResponse<Product>>(ENDPOINTS.CUSTOMER.PRODUCTS.BY_ID(id));
    return res.data.data!;
  },

  searchProducts: async (q: string, districtId?: string) => {
    const res = await api.get<ApiResponse<{ products: ProductSummary[]; shops: ShopSummary[]; categories: Category[] }>>(ENDPOINTS.CUSTOMER.SEARCH.BASE, {
      params: { q, districtId: (districtId ?? getDistrictId()) || undefined },
    });
    return res.data.data!;
  },

  getTrendingSearches: async (districtId?: string) => {
    const res = await api.get<ApiResponse<Array<{ query: string; count: number }>>>(ENDPOINTS.CUSTOMER.SEARCH.TRENDING, {
      params: { districtId: (districtId ?? getDistrictId()) || undefined },
    });
    return res.data.data ?? [];
  }
};
