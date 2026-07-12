import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:4000';

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
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/vendor/login')) {
        window.location.href = window.location.pathname.startsWith('/vendor') ? '/vendor/login' : '/login';
      }
    }
    return Promise.reject(error);
  },
);

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: { code: string; message: string } | null;
  meta?: { page?: number; limit?: number; total?: number };
}
