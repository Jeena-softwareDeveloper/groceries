import { useEffect, useState } from 'react';
import { api, type ApiResponse } from '../api/client';
import { Filter, Plus, ChevronsUpDown, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Ban, Send, Check } from 'lucide-react';

// Generic Pagination component to avoid repetition
const Pagination = ({ count }: { count: number }) => (
  <div className="flex items-center justify-between p-4 px-6 border-t border-slate-200 bg-white">
    <span className="text-sm text-slate-500">Showing 1 to {count} of {count} results</span>
    <div className="flex items-center gap-2">
      <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors"><ChevronLeft size={16} /></button>
      <button className="w-8 h-8 flex items-center justify-center bg-green-600 border border-green-600 rounded-md text-white font-medium cursor-pointer">1</button>
      <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors"><ChevronRight size={16} /></button>
      <select className="ml-4 px-3 py-1.5 border border-slate-200 rounded-md bg-white text-sm text-slate-600 outline-none cursor-pointer">
        <option>10 / page</option>
        <option>20 / page</option>
        <option>50 / page</option>
      </select>
    </div>
  </div>
);

export function BannersPage() {
  const [banners, setBanners] = useState<Array<{ id: string; title: string; isActive: boolean }>>([]);
  const [title, setTitle] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get<ApiResponse<typeof banners>>('/admin/banners').then((r) => setBanners(r.data.data));
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/admin/banners', { title, imageUrl: 'https://placehold.co/800x300', isActive: true });
    setTitle('');
    setShowForm(false);
    load();
  };

  return (
    <div className="text-slate-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="m-0 text-2xl text-slate-900 font-bold">Banners</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-green-600 text-green-600 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors hover:bg-green-50">
            <Filter size={16} /> Filters
          </button>
          <button className="flex items-center gap-2 bg-green-600 border border-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors hover:bg-green-700" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> Add Banner
          </button>
        </div>
      </div>
      {showForm && (
        <form className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white rounded-xl border border-slate-200 shadow-sm" onSubmit={create}>
          <input className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <button type="submit" className="flex items-center gap-2 bg-green-600 border border-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors hover:bg-green-700">Save Banner</button>
        </form>
      )}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap">#</th>
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap"><div className="inline-flex items-center gap-1.5">Image <ChevronsUpDown size={14} className="text-slate-400" /></div></th>
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap"><div className="inline-flex items-center gap-1.5">Title <ChevronsUpDown size={14} className="text-slate-400" /></div></th>
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap"><div className="inline-flex items-center gap-1.5">Status <ChevronsUpDown size={14} className="text-slate-400" /></div></th>
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((b, i) => (
                <tr key={b.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm font-medium text-slate-900">{i + 1}</td>
                  <td className="p-4"><img src="https://placehold.co/100x40" alt="Banner" className="rounded border border-slate-200" /></td>
                  <td className="p-4 text-sm font-medium text-slate-900">{b.title}</td>
                  <td className="p-4 text-sm align-middle">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${b.isActive !== false ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                      {b.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-sm align-middle">
                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-500 cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-colors"><Edit size={14} /></button>
                      <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-red-600 cursor-pointer hover:bg-red-50 hover:border-red-200 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination count={banners.length} />
      </div>
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
    <div className="text-slate-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="m-0 text-2xl text-slate-900 font-bold">Customers</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-green-600 text-green-600 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors hover:bg-green-50">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap">#</th>
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap"><div className="inline-flex items-center gap-1.5">Name <ChevronsUpDown size={14} className="text-slate-400" /></div></th>
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap"><div className="inline-flex items-center gap-1.5">Phone <ChevronsUpDown size={14} className="text-slate-400" /></div></th>
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap"><div className="inline-flex items-center gap-1.5">Status <ChevronsUpDown size={14} className="text-slate-400" /></div></th>
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, i) => (
                <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm font-medium text-slate-900">{i + 1}</td>
                  <td className="p-4 text-sm font-bold text-slate-900">{c.name ?? 'Guest'}</td>
                  <td className="p-4 text-sm font-medium text-slate-900">{c.phone}</td>
                  <td className="p-4 text-sm align-middle">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${c.isBlocked ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                      {c.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="p-4 text-sm align-middle">
                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-500 cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-colors"><Eye size={14} /></button>
                      <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md cursor-pointer transition-colors hover:bg-slate-50" title={c.isBlocked ? 'Unblock' : 'Block'} onClick={() => toggleBlock(c.id, !c.isBlocked)}>
                        <Ban size={14} className={c.isBlocked ? "text-green-600" : "text-red-600"} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination count={customers.length} />
      </div>
    </div>
  );
}

export function MicroBannersPage() {
  const [items, setItems] = useState<Array<{ id: string; title: string; isActive: boolean }>>([]);
  const [title, setTitle] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get<ApiResponse<typeof items>>('/admin/micro-banners').then((r) => setItems(r.data.data));
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/admin/micro-banners', { title, imageUrl: 'https://placehold.co/400x100', isActive: true });
    setTitle('');
    setShowForm(false);
    load();
  };

  return (
    <div className="text-slate-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="m-0 text-2xl text-slate-900 font-bold">Micro Banners</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-green-600 text-green-600 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors hover:bg-green-50">
            <Filter size={16} /> Filters
          </button>
          <button className="flex items-center gap-2 bg-green-600 border border-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors hover:bg-green-700" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> Add Micro Banner
          </button>
        </div>
      </div>
      {showForm && (
        <form className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white rounded-xl border border-slate-200 shadow-sm" onSubmit={create}>
          <input className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <button type="submit" className="flex items-center gap-2 bg-green-600 border border-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors hover:bg-green-700">Save Micro Banner</button>
        </form>
      )}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap">#</th>
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap"><div className="inline-flex items-center gap-1.5">Image <ChevronsUpDown size={14} className="text-slate-400" /></div></th>
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap"><div className="inline-flex items-center gap-1.5">Title <ChevronsUpDown size={14} className="text-slate-400" /></div></th>
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap"><div className="inline-flex items-center gap-1.5">Status <ChevronsUpDown size={14} className="text-slate-400" /></div></th>
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b, i) => (
                <tr key={b.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm font-medium text-slate-900">{i + 1}</td>
                  <td className="p-4"><img src="https://placehold.co/100x40" alt="Micro Banner" className="rounded border border-slate-200" /></td>
                  <td className="p-4 text-sm font-medium text-slate-900">{b.title}</td>
                  <td className="p-4 text-sm align-middle">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${b.isActive !== false ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                      {b.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-sm align-middle">
                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-500 cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-colors"><Edit size={14} /></button>
                      <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-red-600 cursor-pointer hover:bg-red-50 hover:border-red-200 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination count={items.length} />
      </div>
    </div>
  );
}

export function DeliveryChargesPage() {
  const [rules, setRules] = useState<Array<{ id: string; name: string; charge: number; freeAbove?: number; isActive: boolean }>>([]);
  const [name, setName] = useState('');
  const [charge, setCharge] = useState('29');
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get<ApiResponse<typeof rules>>('/admin/delivery-charges').then((r) => setRules(r.data.data));
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/admin/delivery-charges', { name, charge: Number(charge), minDistance: 0, maxDistance: 10, freeAbove: 199, isActive: true });
    setName('');
    setShowForm(false);
    load();
  };

  return (
    <div className="text-slate-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="m-0 text-2xl text-slate-900 font-bold">Delivery Charges</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-green-600 border border-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors hover:bg-green-700" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> Add Rule
          </button>
        </div>
      </div>
      {showForm && (
        <form className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white rounded-xl border border-slate-200 shadow-sm" onSubmit={create}>
          <input className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all" placeholder="Rule name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all" placeholder="Charge ₹" value={charge} onChange={(e) => setCharge(e.target.value)} required />
          <button type="submit" className="flex items-center gap-2 bg-green-600 border border-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors hover:bg-green-700">Save Rule</button>
        </form>
      )}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap">#</th>
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap"><div className="inline-flex items-center gap-1.5">Rule Name <ChevronsUpDown size={14} className="text-slate-400" /></div></th>
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap"><div className="inline-flex items-center gap-1.5">Base Charge <ChevronsUpDown size={14} className="text-slate-400" /></div></th>
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap"><div className="inline-flex items-center gap-1.5">Free Above <ChevronsUpDown size={14} className="text-slate-400" /></div></th>
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap"><div className="inline-flex items-center gap-1.5">Status <ChevronsUpDown size={14} className="text-slate-400" /></div></th>
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r, i) => (
                <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm font-medium text-slate-900">{i + 1}</td>
                  <td className="p-4 text-sm font-medium text-slate-900">{r.name}</td>
                  <td className="p-4 text-sm font-semibold text-green-600">₹{r.charge}</td>
                  <td className="p-4 text-sm font-medium text-slate-900">{r.freeAbove ? `₹${r.freeAbove}` : '—'}</td>
                  <td className="p-4 text-sm align-middle">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${r.isActive !== false ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                      {r.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-sm align-middle">
                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-500 cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-colors"><Edit size={14} /></button>
                      <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-red-600 cursor-pointer hover:bg-red-50 hover:border-red-200 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination count={rules.length} />
      </div>
    </div>
  );
}

export function OffersPage() {
  const [offers, setOffers] = useState<Array<{ id: string; title: string; scope: string; isActive: boolean }>>([]);
  const [title, setTitle] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get<ApiResponse<typeof offers>>('/admin/offers').then((r) => setOffers(r.data.data));
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/admin/offers', { title, scope: 'PLATFORM', discountAmt: 10, isActive: true });
    setTitle('');
    setShowForm(false);
    load();
  };

  return (
    <div className="text-slate-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="m-0 text-2xl text-slate-900 font-bold">Offers</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-green-600 border border-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors hover:bg-green-700" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> Add Offer
          </button>
        </div>
      </div>
      {showForm && (
        <form className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white rounded-xl border border-slate-200 shadow-sm" onSubmit={create}>
          <input className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <button type="submit" className="flex items-center gap-2 bg-green-600 border border-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors hover:bg-green-700">Save Offer</button>
        </form>
      )}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap">#</th>
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap"><div className="inline-flex items-center gap-1.5">Title <ChevronsUpDown size={14} className="text-slate-400" /></div></th>
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap"><div className="inline-flex items-center gap-1.5">Scope <ChevronsUpDown size={14} className="text-slate-400" /></div></th>
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap"><div className="inline-flex items-center gap-1.5">Status <ChevronsUpDown size={14} className="text-slate-400" /></div></th>
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o, i) => (
                <tr key={o.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm font-medium text-slate-900">{i + 1}</td>
                  <td className="p-4 text-sm font-medium text-slate-900">{o.title}</td>
                  <td className="p-4 text-sm align-middle"><span className="bg-green-100 text-green-800 border border-green-200 px-2 py-1 rounded text-xs font-semibold uppercase">{o.scope}</span></td>
                  <td className="p-4 text-sm align-middle">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${o.isActive !== false ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                      {o.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-sm align-middle">
                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-500 cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-colors"><Edit size={14} /></button>
                      <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-red-600 cursor-pointer hover:bg-red-50 hover:border-red-200 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination count={offers.length} />
      </div>
    </div>
  );
}

export function CouponsPage() {
  const [coupons, setCoupons] = useState<Array<{ id: string; code: string; discountValue: number; isActive: boolean }>>([]);
  const [code, setCode] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get<ApiResponse<typeof coupons>>('/admin/coupons').then((r) => setCoupons(r.data.data));
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/admin/coupons', { code, discountAmt: 50, minOrder: 200, isActive: true, scope: 'PLATFORM' });
    setCode('');
    setShowForm(false);
    load();
  };

  return (
    <div className="text-slate-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="m-0 text-2xl text-slate-900 font-bold">Coupons</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-green-600 border border-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors hover:bg-green-700" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> Add Coupon
          </button>
        </div>
      </div>
      {showForm && (
        <form className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white rounded-xl border border-slate-200 shadow-sm" onSubmit={create}>
          <input className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all" placeholder="Code" value={code} onChange={(e) => setCode(e.target.value)} required />
          <button type="submit" className="flex items-center gap-2 bg-green-600 border border-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors hover:bg-green-700">Save Coupon</button>
        </form>
      )}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap">#</th>
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap"><div className="inline-flex items-center gap-1.5">Code <ChevronsUpDown size={14} className="text-slate-400" /></div></th>
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap"><div className="inline-flex items-center gap-1.5">Discount <ChevronsUpDown size={14} className="text-slate-400" /></div></th>
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap"><div className="inline-flex items-center gap-1.5">Status <ChevronsUpDown size={14} className="text-slate-400" /></div></th>
                <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c, i) => (
                <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm font-medium text-slate-900">{i + 1}</td>
                  <td className="p-4 text-sm align-middle"><span className="bg-green-100 text-green-800 border border-dashed border-green-400 px-2 py-1 rounded text-xs font-bold uppercase">{c.code}</span></td>
                  <td className="p-4 text-sm font-semibold text-green-600">₹{c.discountValue} Off</td>
                  <td className="p-4 text-sm align-middle">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${c.isActive !== false ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                      {c.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-sm align-middle">
                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-500 cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-colors"><Edit size={14} /></button>
                      <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-red-600 cursor-pointer hover:bg-red-50 hover:border-red-200 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination count={coupons.length} />
      </div>
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
    <div className="text-slate-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="m-0 text-2xl text-slate-900 font-bold">Broadcast Notification</h1>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm p-6">
        <form className="w-full max-w-[600px]" onSubmit={broadcast}>
          <label className="block mb-4">
            <span className="block mb-2 font-semibold text-slate-900 text-sm">Notification Title</span>
            <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
              className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all"
            />
          </label>
          <label className="block mb-6">
            <span className="block mb-2 font-semibold text-slate-900 text-sm">Message Body</span>
            <textarea 
              value={body} 
              onChange={(e) => setBody(e.target.value)} 
              required 
              rows={4} 
              className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all resize-y"
            />
          </label>
          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-green-600 border border-green-600 text-white px-4 py-3 rounded-lg text-sm font-semibold cursor-pointer transition-colors hover:bg-green-700">
            <Send size={16} /> Send Broadcast to All Customers
          </button>
        </form>
        {sent !== null && (
          <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-lg font-semibold flex items-center gap-2">
            <Check size={20} />
            Successfully sent to {sent} customers!
          </div>
        )}
      </div>
    </div>
  );
}
