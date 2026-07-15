import { useEffect, useState } from 'react';
import { healthApi } from '../api';
import type { HealthStatus } from '@shared/types';
import {
  Calendar, Store, Users, ShoppingBag, IndianRupee, ArrowUp, CheckCircle2, AlertCircle, Star, Apple, Milk, PackageSearch, CupSoda, Cookie, TrendingUp, ArrowRight
} from 'lucide-react';
import './DashboardPage.css';

export default function DashboardPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    healthApi.check()
      .then((res) => setHealth(res.data))
      .catch(() => setHealth(null));
  }, []);

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1600px] mx-auto pb-12 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight m-0 mb-1.5">Welcome back, Super Admin! 👋</h2>
          <p className="text-sm font-medium text-slate-500 m-0">Here's what's happening with your marketplace today.</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-slate-200">
          <Calendar size={16} className="text-slate-500" />
          <span>12 Jul 2025 - 12 Aug 2025</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Vendors', value: '1,248', delta: '12.5%', icon: Store, bg: 'bg-emerald-100', color: 'text-emerald-600' },
          { label: 'Total Customers', value: '24,568', delta: '18.3%', icon: Users, bg: 'bg-blue-100', color: 'text-blue-600' },
          { label: 'Total Orders', value: '8,942', delta: '22.7%', icon: ShoppingBag, bg: 'bg-orange-100', color: 'text-orange-600' },
          { label: 'Total Revenue', value: '₹24,85,320', delta: '28.4%', icon: IndianRupee, bg: 'bg-emerald-100', color: 'text-emerald-600' },
        ].map((kpi, i) => (
          <div key={i} className="group bg-white border border-slate-200/75 rounded-2xl p-5 flex flex-col shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-default">
            <div className="flex justify-between items-start mb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">{kpi.label}</span>
                <h3 className="text-3xl font-black tracking-tight m-0">{kpi.value}</h3>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${kpi.bg} ${kpi.color} shrink-0`}>
                <kpi.icon size={20} strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="flex items-center text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 font-bold">
                <TrendingUp size={11} className="mr-1" strokeWidth={3} /> {kpi.delta}
              </span>
              <span className="opacity-70 group-hover:opacity-100 transition-opacity">vs last 30 days</span>
            </div>
          </div>
        ))}
      </div>

      {/* System Health Status Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-gradient-to-r from-emerald-950 to-emerald-900 border border-emerald-800/50 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            {health?.status === 'ok' ? <CheckCircle2 size={14} strokeWidth={2.5} /> : <AlertCircle size={14} className="text-red-400" />}
            API Status
          </span>
          <span className={`text-sm font-bold ${health?.status !== 'ok' ? 'text-red-400' : 'text-white'}`}>
            {health?.status === 'ok' ? 'Healthy' : health === null ? 'Checking…' : 'Down'}
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            {health?.services.database === 'up' ? <CheckCircle2 size={14} strokeWidth={2.5} /> : <AlertCircle size={14} className="text-red-400" />}
            Database
          </span>
          <span className={`text-sm font-bold ${health?.services.database !== 'up' ? 'text-red-400' : 'text-white'}`}>
            {health?.services.database === 'up' ? 'Operational' : 'Error'}
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            {health?.services.redis === 'up' ? <CheckCircle2 size={14} strokeWidth={2.5} /> : <AlertCircle size={14} className="text-amber-400" />}
            Redis
          </span>
          <span className={`text-sm font-bold ${health?.services.redis !== 'up' ? 'text-amber-400' : 'text-white'}`}>
            {health?.services.redis === 'up' ? 'Operational' : 'Fallback'}
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Server Load</span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-white">32%</span>
            <div className="sparkline-mock flex-1 h-1.5 bg-emerald-800 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-emerald-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: Sales Overview & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.5fr] gap-6">
        {/* Sales Overview */}
        <div className="bg-white border border-slate-200/75 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold tracking-tight m-0">Sales Overview</h3>
            <button className="appearance-none px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-100">
              This Month
            </button>
          </div>
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Sales</span>
            <div className="flex items-end gap-3 text-4xl font-black tracking-tight">
              ₹24,85,320
              <span className="flex items-center text-sm text-emerald-600 font-bold mb-1.5">
                <TrendingUp size={16} className="mr-1" strokeWidth={3} /> 28.4%
                <span className="text-slate-400 font-medium text-xs ml-1.5 tracking-normal">vs last month</span>
              </span>
            </div>
          </div>
          <div className="sales-chart-img flex-1 min-h-[160px]"></div>
          <div className="flex justify-between border-t border-slate-100 pt-5 mt-4">
            {[
              { label: 'This Week', value: '₹8,45,210' },
              { label: 'Today', value: '₹2,35,640' },
              { label: 'Orders', value: '12,458' },
              { label: 'Avg. Order Value', value: '₹278' },
            ].map((stat, i) => (
              <div key={i} className="text-center px-2">
                <strong className="block text-lg font-extrabold mb-1">{stat.value}</strong>
                <span className="text-xs font-medium text-slate-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white border border-slate-200/75 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold tracking-tight m-0">Recent Orders</h3>
            <button className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            {[
              { id: '#ORD12548', name: 'Karthik R.', amount: '₹1,250', status: 'Delivered', statusStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200', time: '2 mins ago', initials: 'KR' },
              { id: '#ORD12547', name: 'Priya S.', amount: '₹850', status: 'Processing', statusStyle: 'bg-yellow-50 text-yellow-700 border-yellow-200', time: '10 mins ago', initials: 'PS' },
              { id: '#ORD12546', name: 'Arun M.', amount: '₹1,560', status: 'Shipped', statusStyle: 'bg-blue-50 text-blue-700 border-blue-200', time: '25 mins ago', initials: 'AM' },
              { id: '#ORD12545', name: 'Meena K.', amount: '₹620', status: 'Pending', statusStyle: 'bg-orange-50 text-orange-700 border-orange-200', time: '45 mins ago', initials: 'MK' },
              { id: '#ORD12544', name: 'Suresh B.', amount: '₹980', status: 'Delivered', statusStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200', time: '1 hour ago', initials: 'SB' },
            ].map((order, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 group hover:bg-slate-50/50 rounded-xl px-2 -mx-2 transition-colors cursor-default">
                <div className="flex items-center gap-3 w-[45%]">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                    {order.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold m-0 leading-tight">{order.name}</p>
                    <p className="text-xs text-slate-400 m-0">{order.id}</p>
                  </div>
                </div>
                <span className="text-sm font-bold w-[20%]">{order.amount}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold border ${order.statusStyle}`}>{order.status}</span>
                <span className="text-xs text-slate-400 w-[18%] text-right">{order.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Top Categories & Top Vendors */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.5fr] gap-6">
        {/* Top Categories */}
        <div className="bg-white border border-slate-200/75 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold tracking-tight m-0">Top Categories</h3>
            <button className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="flex flex-col gap-5">
            {[
              { name: 'Fruits & Vegetables', orders: '1,245 Orders', pct: '100%', icon: Apple, color: 'text-orange-500', bg: 'bg-orange-50' },
              { name: 'Dairy & Bakery', orders: '987 Orders', pct: '80%', icon: Milk, color: 'text-blue-500', bg: 'bg-blue-50' },
              { name: 'Groceries & Staples', orders: '856 Orders', pct: '65%', icon: PackageSearch, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { name: 'Beverages', orders: '642 Orders', pct: '45%', icon: CupSoda, color: 'text-amber-500', bg: 'bg-amber-50' },
              { name: 'Snacks & Branded', orders: '528 Orders', pct: '30%', icon: Cookie, color: 'text-purple-500', bg: 'bg-purple-50' },
            ].map((cat, i) => (
              <div key={i} className="flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-3.5 w-[38%]">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cat.bg} ${cat.color}`}>
                    <cat.icon size={16} strokeWidth={2.5} />
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{cat.name}</span>
                </div>
                <div className="flex-1 h-2 bg-slate-100 rounded-full mx-4 overflow-hidden">
                  <div className="h-full bg-slate-800 rounded-full transition-all duration-500" style={{ width: cat.pct }}></div>
                </div>
                <span className="text-xs font-bold text-slate-500 w-[22%] text-right">{cat.orders}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Vendors Table */}
        <div className="bg-white border border-slate-200/75 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold tracking-tight m-0">Top Vendors</h3>
            <button className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-3 pr-4">Vendor</th>
                  <th className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-3 pr-4">Orders</th>
                  <th className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-3 pr-4">Revenue</th>
                  <th className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-3">Rating</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { name: 'Fresh Mart', orders: '1,245', rev: '₹3,45,210', rating: '4.8', color: 'text-blue-600', bg: 'bg-blue-50' },
                  { name: 'Green Basket', orders: '987', rev: '₹2,85,640', rating: '4.7', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { name: 'Daily Needs', orders: '856', rev: '₹2,15,320', rating: '4.6', color: 'text-amber-600', bg: 'bg-amber-50' },
                  { name: 'Super Store', orders: '642', rev: '₹1,65,980', rating: '4.5', color: 'text-red-500', bg: 'bg-red-50' },
                  { name: 'Quick Shop', orders: '528', rev: '₹1,25,430', rating: '4.4', color: 'text-purple-500', bg: 'bg-purple-50' },
                ].map((v, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group cursor-default">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5 font-bold">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${v.bg} ${v.color}`}>
                          <Store size={13} strokeWidth={2.5} />
                        </div>
                        <span className="group-hover:text-slate-900 transition-colors">{v.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-semibold text-slate-600">{v.orders}</td>
                    <td className="py-3 pr-4 font-bold text-slate-800">{v.rev}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-700">
                        {v.rating} <Star size={12} fill="#f59e0b" color="#f59e0b" strokeWidth={0} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
