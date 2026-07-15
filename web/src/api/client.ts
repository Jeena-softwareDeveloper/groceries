import axios from 'axios';
import type { ApiResponse } from '@shared/types';

const API_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:3000';

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

export const unwrap = async <T>(promise: Promise<{ data: { data?: T } }>): Promise<T> => {
  const res = await promise;
  return res.data.data as T;
};

export function formatPrice(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `₹${num.toFixed(2)}`;
}

