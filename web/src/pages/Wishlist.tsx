import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cartApi, customerApi, getDistrictId } from '../api';
import { useAuth } from '../context/AuthContext';

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<Awaited<ReturnType<typeof customerApi.fetchWishlist>>>([]);

  const load = () => customerApi.fetchWishlist().then(setItems).catch(() => setItems([]));
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!getDistrictId()) { window.location.href = '/location'; return; }
    load();
  }, [isAuthenticated]);

  if (!isAuthenticated) return <p className="page-container">Please <Link to="/login">login</Link>.</p>;

  return (
    <div className="page-container">
      <h1 className="mb-4 text-2xl font-bold">Wishlist</h1>
      {items.length === 0 ? <p>Your wishlist is empty.</p> : (
        <ul className="space-y-3">{items.map((item) => (
          <li key={item.id} className="card flex items-center justify-between gap-4 p-4">
            <Link to={`/products/${item.product.id}`} className="font-medium">{item.product.name}</Link>
            <div className="flex gap-2">
              <button type="button" className="btn-primary px-3 py-1 text-sm" onClick={() => cartApi.addToCart(item.product.id).then(load)}>Add to cart</button>
              <button type="button" className="text-sm text-red-600" onClick={() => customerApi.removeFromWishlist(item.product.id).then(load)}>Remove</button>
            </div>
          </li>
        ))}</ul>
      )}
    </div>
  );
}
