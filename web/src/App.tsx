import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import LocationPage from './pages/Location';
import SearchPage from './pages/Search';
import ShopPage from './pages/Shop';
import ProductPage from './pages/Product';
import CartPage from './pages/Cart';
import CheckoutPage from './pages/Checkout';
import OrdersPage from './pages/Orders';
import ProfilePage from './pages/Profile';
import WishlistPage from './pages/Wishlist';
import NotificationsPage from './pages/Notifications';
import WalletPage from './pages/Wallet';
import SupportPage from './pages/Support';
import { getDistrictId } from './api/client';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function LocationGuard({ children }: { children: React.ReactNode }) {
  const loc = window.location.pathname;
  if (!getDistrictId() && loc !== '/location' && loc !== '/login') {
    return <Navigate to="/location" replace />;
  }
  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/location" element={<AppLayout><LocationPage /></AppLayout>} />
          <Route path="/login" element={<AppLayout><LoginPage /></AppLayout>} />
          <Route path="/" element={<AppLayout><LocationGuard><HomePage /></LocationGuard></AppLayout>} />
          <Route path="/search" element={<AppLayout><LocationGuard><SearchPage /></LocationGuard></AppLayout>} />
          <Route path="/shops" element={<AppLayout><LocationGuard><ShopPage /></LocationGuard></AppLayout>} />
          <Route path="/shops/:id" element={<AppLayout><LocationGuard><ShopPage /></LocationGuard></AppLayout>} />
          <Route path="/products/:id" element={<AppLayout><LocationGuard><ProductPage /></LocationGuard></AppLayout>} />
          <Route path="/wishlist" element={<AppLayout><PrivateRoute><WishlistPage /></PrivateRoute></AppLayout>} />
          <Route path="/notifications" element={<AppLayout><PrivateRoute><NotificationsPage /></PrivateRoute></AppLayout>} />
          <Route path="/wallet" element={<AppLayout><PrivateRoute><WalletPage /></PrivateRoute></AppLayout>} />
          <Route path="/support" element={<AppLayout><PrivateRoute><SupportPage /></PrivateRoute></AppLayout>} />
          <Route
            path="/cart"
            element={
              <AppLayout>
                <PrivateRoute>
                  <CartPage />
                </PrivateRoute>
              </AppLayout>
            }
          />
          <Route
            path="/checkout"
            element={
              <AppLayout>
                <PrivateRoute>
                  <CheckoutPage />
                </PrivateRoute>
              </AppLayout>
            }
          />
          <Route
            path="/orders"
            element={
              <AppLayout>
                <PrivateRoute>
                  <OrdersPage />
                </PrivateRoute>
              </AppLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <AppLayout>
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              </AppLayout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
