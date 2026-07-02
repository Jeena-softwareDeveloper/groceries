import { useEffect, useState } from 'react';
import { api, type ApiResponse } from '../api/client';

export default function AnalyticsPage() {
  const [data, setData] = useState<Record<string, unknown>>({});
  useEffect(() => {
    Promise.all([
      api.get('/admin/analytics/revenue'),
      api.get('/admin/analytics/orders'),
      api.get('/admin/analytics/customers'),
      api.get('/admin/analytics/vendors'),
    ]).then(([rev, ord, cust, vend]) => {
      setData({ revenue: rev.data.data, orders: ord.data.data, customers: cust.data.data, vendors: vend.data.data });
    });
  }, []);
  return <div><h1>Analytics</h1><pre className="settings-preview">{JSON.stringify(data, null, 2)}</pre></div>;
}

export function BannersPage() {
  const [banners, setBanners] = useState<Array<{ id: string; title: string }>>([]);
  const [title, setTitle] = useState('');
  const load = () => api.get<ApiResponse<typeof banners>>('/admin/banners').then((r) => setBanners(r.data.data));
  useEffect(() => { load(); }, []);
  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/admin/banners', { title, imageUrl: 'https://placehold.co/800x300', isActive: true });
    setTitle(''); load();
  };
  return (
    <div>
      <h1>Banners</h1>
      <form className="inline-form" onSubmit={create}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <button type="submit">Add Banner</button>
      </form>
      <ul>{banners.map((b) => <li key={b.id}>{b.title}</li>)}</ul>
    </div>
  );
}

export function CustomersPage() {
  const [customers, setCustomers] = useState<Array<{ id: string; phone: string; name?: string; isBlocked: boolean }>>([]);
  const load = () => api.get<ApiResponse<typeof customers>>('/admin/customers').then((r) => setCustomers(r.data.data));
  useEffect(() => { load(); }, []);
  const toggleBlock = async (id: string, block: boolean) => {
    await api.post(`/admin/customers/${id}/${block ? 'block' : 'unblock'}`);
    load();
  };
  return (
    <div>
      <h1>Customers</h1>
      <table className="data-table">
        <thead><tr><th>Phone</th><th>Name</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{customers.map((c) => (
          <tr key={c.id}>
            <td>{c.phone}</td><td>{c.name ?? '—'}</td><td>{c.isBlocked ? 'Blocked' : 'Active'}</td>
            <td><button type="button" onClick={() => toggleBlock(c.id, !c.isBlocked)}>{c.isBlocked ? 'Unblock' : 'Block'}</button></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

export function MicroBannersPage() {
  const [items, setItems] = useState<Array<{ id: string; title: string }>>([]);
  const [title, setTitle] = useState('');
  const load = () => api.get<ApiResponse<typeof items>>('/admin/micro-banners').then((r) => setItems(r.data.data));
  useEffect(() => { load(); }, []);
  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/admin/micro-banners', { title, imageUrl: 'https://placehold.co/400x100', isActive: true });
    setTitle(''); load();
  };
  return (
    <div>
      <h1>Micro Banners</h1>
      <form className="inline-form" onSubmit={create}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <button type="submit">Add Micro Banner</button>
      </form>
      <ul>{items.map((b) => <li key={b.id}>{b.title}</li>)}</ul>
    </div>
  );
}

export function DeliveryChargesPage() {
  const [rules, setRules] = useState<Array<{ id: string; name: string; charge: number; freeAbove?: number }>>([]);
  const [name, setName] = useState('');
  const [charge, setCharge] = useState('29');
  const load = () => api.get<ApiResponse<typeof rules>>('/admin/delivery-charges').then((r) => setRules(r.data.data));
  useEffect(() => { load(); }, []);
  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/admin/delivery-charges', { name, charge: Number(charge), minDistance: 0, maxDistance: 10, freeAbove: 199, isActive: true });
    setName(''); load();
  };
  return (
    <div>
      <h1>Delivery Charges</h1>
      <form className="inline-form" onSubmit={create}>
        <input placeholder="Rule name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Charge ₹" value={charge} onChange={(e) => setCharge(e.target.value)} required />
        <button type="submit">Add Rule</button>
      </form>
      <ul>{rules.map((r) => <li key={r.id}>{r.name} — ₹{r.charge}{r.freeAbove ? ` (free above ₹${r.freeAbove})` : ''}</li>)}</ul>
    </div>
  );
}

export function OffersPage() {
  const [offers, setOffers] = useState<Array<{ id: string; title: string; scope: string }>>([]);
  const [title, setTitle] = useState('');
  const load = () => api.get<ApiResponse<typeof offers>>('/admin/offers').then((r) => setOffers(r.data.data));
  useEffect(() => { load(); }, []);
  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/admin/offers', { title, scope: 'PLATFORM', discountAmt: 10, isActive: true });
    setTitle(''); load();
  };
  return (
    <div>
      <h1>Offers</h1>
      <form className="inline-form" onSubmit={create}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <button type="submit">Add Offer</button>
      </form>
      <ul>{offers.map((o) => <li key={o.id}>{o.title} ({o.scope})</li>)}</ul>
    </div>
  );
}

export function CouponsPage() {
  const [coupons, setCoupons] = useState<Array<{ id: string; code: string; discountValue: number }>>([]);
  const [code, setCode] = useState('');
  const load = () => api.get<ApiResponse<typeof coupons>>('/admin/coupons').then((r) => setCoupons(r.data.data));
  useEffect(() => { load(); }, []);
  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/admin/coupons', { code, discountAmt: 50, minOrder: 200, isActive: true, scope: 'PLATFORM' });
    setCode(''); load();
  };
  return (
    <div>
      <h1>Coupons</h1>
      <form className="inline-form" onSubmit={create}>
        <input placeholder="Code" value={code} onChange={(e) => setCode(e.target.value)} required />
        <button type="submit">Add Coupon</button>
      </form>
      <ul>{coupons.map((c) => <li key={c.id}>{c.code} — ₹{c.discountValue} off</li>)}</ul>
    </div>
  );
}

export function NotificationsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sent, setSent] = useState<number | null>(null);
  const broadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.post<ApiResponse<{ sent: number }>>('/admin/notifications/broadcast', { title, body });
    setSent(res.data.data.sent);
  };
  return (
    <div>
      <h1>Broadcast Notification</h1>
      <form className="settings-form" onSubmit={broadcast}>
        <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
        <label>Message<textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={3} /></label>
        <button type="submit">Send Broadcast</button>
      </form>
      {sent !== null && <p>Sent to {sent} customers</p>}
    </div>
  );
}
