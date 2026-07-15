import { api } from './client';
import { ENDPOINTS } from './endpoints';
import type { ApiResponse } from './client';

export const notificationApi = {
  fetchNotifications: async () => {
    const res = await api.get<ApiResponse<Array<{ id: string; title: string; body: string; isRead: boolean }>>>(ENDPOINTS.CUSTOMER.NOTIFICATIONS.BASE);
    return res.data.data ?? [];
  }
};
