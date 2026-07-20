import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sessionManager } from '../utils/session';

export default function GuestGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    if (!sessionManager.getDistrictId()) {
      return <Navigate to="/location" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
