import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { cartApi } from '../api';

export default function Header() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setCartCount(0);
      return;
    }
    cartApi.getCart()
      .then((cart) => setCartCount(cart.items.reduce((sum, i) => sum + i.quantity, 0)))
      .catch(() => setCartCount(0));
  }, [isAuthenticated, location.pathname]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/search', label: 'Search' },
    { to: '/shops', label: 'Shops' },
    { to: '/wishlist', label: 'Wishlist', auth: true },
    { to: '/orders', label: 'Orders', auth: true },
    { to: '/profile', label: 'Profile', auth: true },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="All Time Market" className="w-10 h-10 object-contain" />
          <span className="text-xl font-bold text-gray-900 tracking-tight">All Time Market</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.filter((l) => !l.auth || isAuthenticated).map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-gray-100 ${
                location.pathname === link.to ? 'text-primary-600' : 'text-gray-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/location" className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100">Location</Link>
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link to="/cart" className="relative rounded-lg p-2 text-gray-600 transition hover:bg-gray-100" aria-label="Cart">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
              <button type="button" onClick={logout} className="hidden rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 sm:block">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary px-4 py-2 text-sm">Login</Link>
          )}
        </div>
      </div>

      <nav className="flex border-t border-gray-100 md:hidden">
        {navLinks.filter((l) => !l.auth || isAuthenticated).map((link) => (
          <Link key={link.to} to={link.to} className={`flex flex-1 flex-col items-center py-2 text-xs font-medium ${location.pathname === link.to ? 'text-primary-600' : 'text-gray-500'}`}>
            {link.label}
          </Link>
        ))}
        {isAuthenticated && (
          <Link to="/cart" className={`flex flex-1 flex-col items-center py-2 text-xs font-medium ${location.pathname === '/cart' ? 'text-primary-600' : 'text-gray-500'}`}>
            Cart{cartCount > 0 ? ` (${cartCount})` : ''}
          </Link>
        )}
      </nav>
    </header>
  );
}
