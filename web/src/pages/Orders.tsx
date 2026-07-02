import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { formatPrice, listOrders, type Order } from '../api/client';

const statusColors: Record<string, string> = {
  PLACED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-indigo-100 text-indigo-700',
  PREPARING: 'bg-amber-100 text-amber-700',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  const location = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const newOrders = (location.state as { newOrders?: Order[] })?.newOrders;
    if (newOrders?.length) {
      setSuccessMsg(`Order placed successfully! ${newOrders.length} order(s) created.`);
      window.history.replaceState({}, '');
    }

    listOrders()
      .then((r) => setOrders(r.orders))
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [location.state]);

  if (loading) {
    return (
      <div className="page-container flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="page-container pb-20 md:pb-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Orders</h1>

      {successMsg && (
        <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMsg}
        </div>
      )}
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">No orders yet</p>
          <Link to="/shops" className="btn-primary mt-4 inline-block">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">
                    {order.vendor?.shopName} · {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    statusColors[order.status] ?? 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="mt-4 space-y-1 border-t border-gray-100 pt-4 text-sm">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-gray-600">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>{formatPrice(item.total)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="font-bold text-gray-900">{formatPrice(order.grandTotal)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
