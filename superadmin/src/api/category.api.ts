import { api } from './client';
import { ENDPOINTS } from './endpoints';
import type { ApiResponse, Category, CreateCategoryDto } from '../types';

export const categoryApi = {
  getAll: () => api.get<ApiResponse<Category[]>>(ENDPOINTS.ADMIN.CATEGORIES).then(res => res.data),
  create: (data: CreateCategoryDto) => api.post<ApiResponse<Category>>(ENDPOINTS.ADMIN.CATEGORIES, data).then(res => res.data),
  getVendorCategories: () => api.get<ApiResponse<any>>(ENDPOINTS.VENDOR.CATEGORIES).then(res => res.data),
};
