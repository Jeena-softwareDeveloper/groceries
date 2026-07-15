import { api, unwrap } from './client';
import { ENDPOINTS } from './endpoints';
import type { ApiResponse } from './client';

export interface CustomerProfile {
  id: string;
  phone: string;
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  role?: string;
}

export const authApi = {
  requestOtp: async (phone: string) => {
    const res = await api.post<ApiResponse<{ message: string; otp?: string }>>(
      ENDPOINTS.AUTH.OTP_REQUEST,
      { phone }
    );
    return res.data.data!;
  },

  verifyOtp: async (phone: string, otp: string) => {
    const res = await api.post<ApiResponse<{ accessToken: string; refreshToken: string; role: string }>>(
      ENDPOINTS.AUTH.OTP_VERIFY,
      { phone, otp }
    );
    return res.data.data!;
  },

  getMe: async () => {
    const res = await api.get<ApiResponse<CustomerProfile>>(ENDPOINTS.AUTH.ME);
    return res.data.data!;
  },

  logout: async (refreshToken: string) => {
    await api.post(ENDPOINTS.AUTH.LOGOUT, { refreshToken }).catch(() => {});
  },
};
