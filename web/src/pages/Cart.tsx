import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  formatPrice,
  getCart,
  removeFromCart,
  updateCartItem,
  type Cart,
} from '../api/client';

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadCart = () => {
    getCart()
      .then(setCart)
      .catch(() => setError('Failed to load cart'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleQuantityChange = async (productId: string, quantity: number) => {
    setUpdating(productId);
    try {
      await updateCartItem(productId, quantity);
      loadCart();
    } catch {
      setError('Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (productId: string) => {
    setUpdating(productId);
    try {
      await removeFromCart(productId);
      loadCart();
    } catch {
      setError('Failed to remove item');
    } finally {
      setUpdating(null);
    }
  };

  const total =
    cart?.items.reduce(
      (sum, item) => sum + Number(item.product.sellingPrice) * item.quantity,
      0,
    ) ?? 0;

  if (loading) {
    return (
      <div className="page-container flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="page-container pb-20 text-center md:pb-8">
        <div className="mx-auto max-w-sm py-16">
          <svg
            className="mx-auto h-16 w-16 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Your cart is empty</h2>
          <p className="mt-2 text-gray-500">Add items from shops to get started</p>
          <Link to="/shops" className="btn-primary mt-6 inline-block">
            Browse Shops
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container pb-32 md:pb-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Your Cart</h1>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {cart.byVendor.map((group) => (
            <div key={group.vendorId} className="card">
              <h2 className="mb-4 font-semibold text-gray-900">{group.vendor.shopName}</h2>
              <div className="space-y-4">
                {group.items.map((item) => {
                  const imageUrl =
                    item.product.images?.find((i) => i.isPrimary)?.url ??
                    item.product.images?.[0]?.url;
                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {imageUrl ? (
                          <img src={imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-400 text-xs">
                            No img
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <Link
                          to={`/products/${item.productId}`}
                          className="font-medium text-gray-900 hover:text-primary-600"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-sm text-gray-500">{item.product.unit}</p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {formatPrice(item.product.sellingPrice)}
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex items-center rounded border border-gray-300">
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                              disabled={updating === item.productId}
                              className="px-2 py-1 text-gray-600 hover:bg-gray-50"
                            >
                              −
                            </button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                              disabled={updating === item.productId}
                              className="px-2 py-1 text-gray-600 hover:bg-gray-50"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemove(item.productId)}
                            disabled={updating === item.productId}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="text-right font-semibold text-gray-900">
                        {formatPrice(Number(item.product.sellingPrice) * item.quantity)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="card">
            <h2 className="mb-4 font-semibold text-gray-900">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery</span>
                <span className="font-medium text-green-600">Calculated at checkout</span>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
            <Link to="/checkout" className="btn-primary mt-6 block w-full text-center">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
