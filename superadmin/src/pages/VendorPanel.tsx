import { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, type ApiResponse } from '../api/client';

export default function VendorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (user?.role !== 'VENDOR') return null;

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>{user.shopName ?? 'Vendor'}</h2>
        <p className="sidebar-role">Vendor Panel</p>
        <nav>
          <Link to="/vendor">Dashboard</Link>
          <Link to="/vendor/products">Products</Link>
          <Link to="/vendor/inventory">Inventory</Link>
          <Link to="/vendor/orders">Orders</Link>
        </nav>
        <div className="sidebar-footer">
          <button type="button" onClick={() => { logout(); navigate('/vendor/login'); }}>Logout</button>
        </div>
      </aside>
      <main className="main-content"><Outlet /></main>
    </div>
  );
}

export function VendorDashboard() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  useEffect(() => { api.get<ApiResponse<Record<string, unknown>>>('/vendor/dashboard').then((r) => setStats(r.data.data)); }, []);
  return <div><h1>Vendor Dashboard</h1><pre>{JSON.stringify(stats, null, 2)}</pre></div>;
}

export function VendorProducts() {
  const [products, setProducts] = useState<Array<{ id: string; name: string; sellingPrice: number; status: string }>>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  const load = () => api.get<ApiResponse<{ items: typeof products }>>('/vendor/products').then((r) => setProducts(r.data.data.items ?? r.data.data as unknown as typeof products));
  useEffect(() => { load(); api.get<ApiResponse<typeof categories>>('/vendor/categories').then((r) => setCategories(r.data.data)); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/vendor/products', { name, slug, categoryId, mrp: 100, sellingPrice: 90, unit: '1pc', stock: 50 });
    setName(''); setSlug('');
    load();
  };

  return (
    <div>
      <h1>Products</h1>
      <form className="inline-form" onSubmit={create}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
          <option value="">Category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button type="submit">Add Product</button>
      </form>
      <table className="data-table">
        <thead><tr><th>Name</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td><td>₹{p.sellingPrice}</td><td>{p.status}</td>
              <td>{p.status !== 'PUBLISHED' && <button type="button" onClick={() => api.post(`/vendor/products/${p.id}/publish`).then(load)}>Publish</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function VendorInventory() {
  const [products, setProducts] = useState<Array<{ id: string; name: string; inventory?: { stock: number } }>>([]);
  const load = () => api.get<ApiResponse<{ items: typeof products }>>('/vendor/products').then((r) => setProducts(r.data.data.items ?? r.data.data as unknown as typeof products));
  useEffect(() => { load(); }, []);
  const updateStock = async (productId: string, stock: number) => {
    await api.put(`/vendor/inventory/${productId}`, { stock });
    load();
  };
  return (
    <div>
      <h1>Inventory</h1>
      <table className="data-table">
        <thead><tr><th>Product</th><th>Stock</th><th>Update</th></tr></thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.inventory?.stock ?? 0}</td>
              <td>
                <button type="button" onClick={() => updateStock(p.id, (p.inventory?.stock ?? 0) + 10)}>+10</button>
                <button type="button" onClick={() => updateStock(p.id, Math.max(0, (p.inventory?.stock ?? 0) - 1))}>-1</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function VendorOrders() {
  const [orders, setOrders] = useState<Array<{ id: string; orderNumber: string; status: string; grandTotal: number }>>([]);
  const load = () => api.get<ApiResponse<{ items: typeof orders }>>('/vendor/orders').then((r) => setOrders(r.data.data.items ?? r.data.data as unknown as typeof orders));
  useEffect(() => { load(); const t = setInterval(load, 10000); return () => clearInterval(t); }, []);
  return (
    <div>
      <h1>Orders</h1>
      <table className="data-table">
        <thead><tr><th>Order</th><th>Status</th><th>Total</th><th>Actions</th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.orderNumber}</td><td>{o.status}</td><td>₹{o.grandTotal}</td>
              <td className="actions">
                {o.status === 'PLACED' && <button type="button" onClick={() => api.patch(`/vendor/orders/${o.id}`, { status: 'CONFIRMED' }).then(load)}>Confirm</button>}
                {o.status === 'CONFIRMED' && <button type="button" onClick={() => api.patch(`/vendor/orders/${o.id}`, { status: 'PACKED' }).then(load)}>Packed</button>}
                {o.status === 'PACKED' && <button type="button" onClick={() => api.patch(`/vendor/orders/${o.id}`, { status: 'OUT_FOR_DELIVERY' }).then(load)}>Dispatch</button>}
                {o.status === 'OUT_FOR_DELIVERY' && <button type="button" onClick={() => api.patch(`/vendor/orders/${o.id}`, { status: 'DELIVERED' }).then(load)}>Delivered</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
