import { useEffect, useState } from 'react';
import { api, type ApiResponse } from '../api/client';
import { Filter, Plus, ChevronsUpDown, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface District {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  _count?: { areas: number };
}

export default function DistrictsPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);

  // Hidden form state
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const load = () => {
    api
      .get<ApiResponse<District[]>>('/admin/districts')
      .then((res) => setDistricts(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/admin/districts', { name, code, isActive: true });
    setName('');
    setCode('');
    setShowForm(false);
    load();
  };

  return (
    <div className="text-slate-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="m-0 text-2xl text-slate-900 font-bold">Districts</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-green-600 text-green-600 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors hover:bg-green-50">
            <Filter size={16} /> Filters
          </button>
          <button className="flex items-center gap-2 bg-green-600 border border-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors hover:bg-green-700" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> Add District
          </button>
        </div>
      </div>

      {showForm && (
        <form className="flex items-center gap-4 mb-6 p-4 bg-white rounded-xl border border-slate-200 shadow-sm" onSubmit={handleCreate}>
          <input className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all" placeholder="District name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all" placeholder="Code (e.g. CHN)" value={code} onChange={(e) => setCode(e.target.value)} required />
          <button type="submit" className="flex items-center gap-2 bg-green-600 border border-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors hover:bg-green-700">Save District</button>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <p className="p-6 m-0 text-slate-500">Loading…</p>
        ) : (
          <>
            <div className="overflow-x-auto w-full">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap">#</th>
                    <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">District Name <ChevronsUpDown size={14} className="text-slate-400" /></div>
                    </th>
                    <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">Code <ChevronsUpDown size={14} className="text-slate-400" /></div>
                    </th>
                    <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">Total Areas <ChevronsUpDown size={14} className="text-slate-400" /></div>
                    </th>
                    <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">Total Vendors <ChevronsUpDown size={14} className="text-slate-400" /></div>
                    </th>
                    <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">Total Customers <ChevronsUpDown size={14} className="text-slate-400" /></div>
                    </th>
                    <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">Status <ChevronsUpDown size={14} className="text-slate-400" /></div>
                    </th>
                    <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">Created On <ChevronsUpDown size={14} className="text-slate-400" /></div>
                    </th>
                    <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {districts.map((d, index) => {
                    const mockVendors = d.code === 'BLR' ? 98 : d.code === 'CHN' ? 58 : Math.floor(Math.random() * 100);
                    const mockCustomers = d.code === 'BLR' ? '12,458' : d.code === 'CHN' ? '12,110' : '4,230';
                    const mockDate = d.code === 'BLR' ? '10 Jul 2025' : '11 Jul 2025';

                    return (
                      <tr key={d.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-sm font-medium text-slate-900">{index + 1}</td>
                        <td className="p-4 text-sm font-medium text-slate-900">{d.name}</td>
                        <td className="p-4 text-sm align-middle">
                          <span className="bg-green-100 text-green-800 border border-green-200 px-2 py-1 rounded text-xs font-semibold uppercase">{d.code}</span>
                        </td>
                        <td className="p-4 text-sm font-medium text-slate-900">{d._count?.areas ?? 0}</td>
                        <td className="p-4 text-sm font-semibold text-green-600">{mockVendors}</td>
                        <td className="p-4 text-sm font-semibold text-green-600">{mockCustomers}</td>
                        <td className="p-4 text-sm align-middle">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${d.isActive ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                            {d.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4 text-sm font-medium text-slate-900">{mockDate}</td>
                        <td className="p-4 text-sm align-middle">
                          <div className="flex items-center gap-2">
                            <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-500 cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-colors"><Eye size={14} /></button>
                            <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-500 cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-colors"><Edit size={14} /></button>
                            <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-red-600 cursor-pointer hover:bg-red-50 hover:border-red-200 transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between p-4 px-6 border-t border-slate-200 bg-white">
              <span className="text-sm text-slate-500">Showing 1 to {districts.length} of {districts.length} results</span>
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
          </>
        )}
      </div>
    </div>
  );
}
