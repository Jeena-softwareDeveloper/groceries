import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants';

export function VendorRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <p className="loading">Loading…</p>;
  if (!user || user.role !== 'VENDOR') return <Navigate to={ROUTES.VENDOR_LOGIN} replace />;
  
  return <>{children}</>;
}
