import { Navigate, useLocation } from 'react-router-dom';
import { sessionManager } from '../utils/session';

export default function LocationGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  if (!sessionManager.getDistrictId() && location.pathname !== '/location' && location.pathname !== '/login') {
    return <Navigate to="/location" replace />;
  }

  return <>{children}</>;
}
