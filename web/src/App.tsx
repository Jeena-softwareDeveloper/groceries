import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthGuard from './guards/AuthGuard';
import GuestGuard from './guards/GuestGuard';
import LocationGuard from './guards/LocationGuard';

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
          {/* Public / Guest Routes */}
          <Route path="/location" element={<AppLayout><LocationPage /></AppLayout>} />
          <Route path="/login" element={<AppLayout><GuestGuard><LoginPage /></GuestGuard></AppLayout>} />
          
          {/* Protected Routes */}
          <Route path="/" element={<AppLayout><AuthGuard><HomePage /></AuthGuard></AppLayout>} />
          <Route path="/search" element={<AppLayout><AuthGuard><SearchPage /></AuthGuard></AppLayout>} />
          <Route path="/shops" element={<AppLayout><AuthGuard><ShopPage /></AuthGuard></AppLayout>} />
          <Route path="/shops/:id" element={<AppLayout><AuthGuard><ShopPage /></AuthGuard></AppLayout>} />
          <Route path="/products/:id" element={<AppLayout><AuthGuard><ProductPage /></AuthGuard></AppLayout>} />
          <Route path="/wishlist" element={<AppLayout><AuthGuard><WishlistPage /></AuthGuard></AppLayout>} />
          <Route path="/notifications" element={<AppLayout><AuthGuard><NotificationsPage /></AuthGuard></AppLayout>} />
          <Route path="/wallet" element={<AppLayout><AuthGuard><WalletPage /></AuthGuard></AppLayout>} />
          <Route path="/support" element={<AppLayout><AuthGuard><SupportPage /></AuthGuard></AppLayout>} />
          <Route path="/cart" element={<AppLayout><AuthGuard><CartPage /></AuthGuard></AppLayout>} />
          <Route path="/checkout" element={<AppLayout><AuthGuard><CheckoutPage /></AuthGuard></AppLayout>} />
          <Route path="/orders" element={<AppLayout><AuthGuard><OrdersPage /></AuthGuard></AppLayout>} />
          <Route path="/profile" element={<AppLayout><AuthGuard><ProfilePage /></AuthGuard></AppLayout>} />
          
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
