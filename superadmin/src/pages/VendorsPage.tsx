import { useEffect, useState } from 'react';
import { api, type ApiResponse } from '../api/client';
import { Filter, ChevronsUpDown, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';

interface Vendor {
  id: string;
  shopName: string;
  email: string;
  status: string;
  area: { name: string; district: { name: string } };
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = () => {
    const params = filter ? `?status=${filter}` : '';
    api.get<ApiResponse<Vendor[]>>(`/admin/vendors${params}`).then((res) => {
      setVendors(res.data.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, [filter]);

  const approve = async (id: string) => {
    await api.post(`/admin/vendors/${id}/approve`);
    load();
  };

  const reject = async (id: string) => {
    await api.post(`/admin/vendors/${id}/reject`, { reason: 'Does not meet requirements' });
    load();
  };

  return (
    <div className="text-slate-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="m-0 text-2xl text-slate-900 font-bold">Vendors</h1>
        <div className="flex items-center gap-3">
          <select 
            className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-600 outline-none cursor-pointer focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all" 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
          </select>
          <button className="flex items-center gap-2 bg-white border border-green-600 text-green-600 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors hover:bg-green-50">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

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
                      <div className="inline-flex items-center gap-1.5">Shop <ChevronsUpDown size={14} className="text-slate-400" /></div>
                    </th>
                    <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">Email <ChevronsUpDown size={14} className="text-slate-400" /></div>
                    </th>
                    <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">Location <ChevronsUpDown size={14} className="text-slate-400" /></div>
                    </th>
                    <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">Status <ChevronsUpDown size={14} className="text-slate-400" /></div>
                    </th>
                    <th className="p-4 text-left text-xs font-bold text-slate-900 capitalize whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v, index) => (
                    <tr key={v.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-sm font-medium text-slate-900">{index + 1}</td>
                      <td className="p-4 text-sm font-medium text-slate-900"><strong>{v.shopName}</strong></td>
                      <td className="p-4 text-sm font-medium text-slate-900">{v.email}</td>
                      <td className="p-4 text-sm font-medium text-slate-900">
                        {v.area.name}, {v.area.district.name}
                      </td>
                      <td className="p-4 text-sm align-middle">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          v.status === 'APPROVED' ? 'bg-green-50 text-green-600 border-green-200' : 
                          v.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                          'bg-red-50 text-red-600 border-red-200'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm align-middle">
                        <div className="flex items-center gap-2">
                          {v.status === 'PENDING' ? (
                            <>
                              <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-green-600 cursor-pointer hover:bg-green-50 hover:border-green-200 transition-colors" title="Approve" onClick={() => approve(v.id)}>
                                <Check size={14} />
                              </button>
                              <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-red-600 cursor-pointer hover:bg-red-50 hover:border-red-200 transition-colors" title="Reject" onClick={() => reject(v.id)}>
                                <X size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-500 cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-colors"><Eye size={14} /></button>
                              <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-500 cursor-pointer hover:bg-slate-50 hover:text-slate-900 transition-colors"><Edit size={14} /></button>
                              <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-red-600 cursor-pointer hover:bg-red-50 hover:border-red-200 transition-colors"><Trash2 size={14} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between p-4 px-6 border-t border-slate-200 bg-white">
              <span className="text-sm text-slate-500">Showing 1 to {vendors.length} of {vendors.length} results</span>
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
