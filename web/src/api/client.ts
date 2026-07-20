import axios from 'axios';
import { sessionManager } from '../utils/session';
import type { ApiResponse } from '@shared/types';

const API_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  config.url = `/api/v1${config.url}`;
  const token = sessionManager.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      sessionManager.clearSession();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export type { ApiResponse };

export const getDistrictId = () => sessionManager.getDistrictId() ?? '';
export const getAreaId = () => sessionManager.getAreaId();
export const setLocation = (d: string, a?: string, dn?: string, an?: string) => sessionManager.setLocation(d, a, dn, an);

export const unwrap = async <T>(promise: Promise<{ data: { data?: T } }>): Promise<T> => {
  const res = await promise;
  return res.data.data as T;
};

export function formatPrice(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `₹${num.toFixed(2)}`;
}

