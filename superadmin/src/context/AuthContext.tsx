import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api, type ApiResponse } from '../api/client';

interface User {
  id: string;
  email: string;
  name?: string;
  shopName?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginAdmin: (email: string, password: string) => Promise<void>;
  loginVendor: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function saveTokens(res: ApiResponse<{ accessToken: string; refreshToken: string }>) {
  localStorage.setItem('accessToken', res.data.accessToken);
  localStorage.setItem('refreshToken', res.data.refreshToken);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { setLoading(false); return; }
    api.get<ApiResponse<User>>('/auth/me').then((res) => setUser(res.data.data)).catch(() => localStorage.clear()).finally(() => setLoading(false));
  }, []);

  const loginAdmin = async (email: string, password: string) => {
    const res = await api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/admin/login', { email, password });
    await saveTokens(res.data);
    const me = await api.get<ApiResponse<User>>('/auth/me');
    setUser(me.data.data);
  };

  const loginVendor = async (email: string, password: string) => {
    const res = await api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/vendor/login', { email, password });
    await saveTokens(res.data);
    const me = await api.get<ApiResponse<User>>('/auth/me');
    setUser(me.data.data);
  };

  const logout = () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) api.post('/auth/logout', { refreshToken }).catch(() => {});
    localStorage.clear();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, loginAdmin, loginVendor, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
