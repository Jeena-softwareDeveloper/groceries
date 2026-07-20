import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi, type CustomerProfile } from '../api';
import { sessionManager } from '../utils/session';

interface AuthContextType {
  user: CustomerProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  setUser: (user: CustomerProfile | null) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = sessionManager.getAccessToken();
    if (!token) {
      setUser(null);
      return;
    }
    const profile = await authApi.getMe();
    setUser(profile);
  };

  useEffect(() => {
    const token = sessionManager.getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    authApi.getMe()
      .then(setUser)
      .catch(() => sessionManager.clearSession())
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    authApi.logout(sessionManager.getRefreshToken() ?? '').catch(() => {});
    sessionManager.clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        setUser,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
