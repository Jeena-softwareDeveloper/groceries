import { api } from './client';
import { ENDPOINTS } from './endpoints';
import type { ApiResponse } from './client';

export const walletApi = {
  fetchWallet: async () => {
    const res = await api.get<ApiResponse<{ balance: number; transactions: Array<{ id: string; amount: number; type: string }> }>>(ENDPOINTS.CUSTOMER.WALLET);
    return res.data.data!;
  }
};
