import { useEffect, useState } from 'react';
import { api, type ApiResponse } from '../api/client';
import type { HealthStatus } from '@shared/types';
import {
  Calendar, Store, Users, ShoppingBag, IndianRupee, ArrowUp, CheckCircle2, AlertCircle, Star, Apple, Milk, PackageSearch, CupSoda, Cookie
} from 'lucide-react';
import './DashboardPage.css';

export default function DashboardPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:4000'}/api/v1/health`)
      .then((r) => r.json())
      .then((body: ApiResponse<HealthStatus>) => setHealth(body.data))
      .catch(() => setHealth(null));
  }, []);

  return (
    <div className="flex flex-col gap-6 text-slate-900">
      {/* Header */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-2xl font-bold m-0 mb-2">Welcome back, Super Admin! 👋</h2>
          <p className="text-sm text-slate-500 m-0">Here's what's happening with your marketplace today.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm text-slate-600 cursor-pointer shadow-sm hover:bg-slate-50 transition-colors">
          <Calendar size={16} />
          <span>12 Jul 2025 - 12 Aug 2025</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-sm text-slate-500 font-medium block mb-2">Total Vendors</span>
              <h3 className="text-3xl font-extrabold m-0">1,248</h3>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100 text-green-600 shrink-0">
              <Store size={24} />
            </div>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <span className="text-green-600 font-bold flex items-center"><ArrowUp size={14} /> 12.5%</span> vs last 30 days
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-sm text-slate-500 font-medium block mb-2">Total Customers</span>
              <h3 className="text-3xl font-extrabold m-0">24,568</h3>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 shrink-0">
              <Users size={24} />
            </div>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <span className="text-green-600 font-bold flex items-center"><ArrowUp size={14} /> 18.3%</span> vs last 30 days
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-sm text-slate-500 font-medium block mb-2">Total Orders</span>
              <h3 className="text-3xl font-extrabold m-0">8,942</h3>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-orange-100 text-orange-600 shrink-0">
              <ShoppingBag size={24} />
            </div>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <span className="text-green-600 font-bold flex items-center"><ArrowUp size={14} /> 22.7%</span> vs last 30 days
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-sm text-slate-500 font-medium block mb-2">Total Revenue</span>
              <h3 className="text-3xl font-extrabold m-0">₹24,85,320</h3>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100 text-green-600 shrink-0">
              <IndianRupee size={24} />
            </div>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <span className="text-green-600 font-bold flex items-center"><ArrowUp size={14} /> 28.4%</span> vs last 30 days
          </div>
        </div>
      </div>

      {/* Real API Status Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-green-50 border border-green-200 rounded-xl p-4 lg:p-5">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-green-800 font-semibold flex items-center gap-1.5">
            {health?.status === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} className="text-red-600" />}
            API Status
          </span>
          <span className={`text-sm font-bold ${health?.status !== 'ok' ? 'text-red-600' : 'text-green-700'}`}>
            {health?.status === 'ok' ? 'Healthy' : 'Down'}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-green-800 font-semibold flex items-center gap-1.5">
            {health?.services.database === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} className="text-red-600" />}
            Database
          </span>
          <span className={`text-sm font-bold ${health?.services.database !== 'ok' ? 'text-red-600' : 'text-green-700'}`}>
            {health?.services.database === 'ok' ? 'Operational' : 'Error'}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-green-800 font-semibold flex items-center gap-1.5">
            {health?.services.redis === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} className="text-red-600" />}
            Redis
          </span>
          <span className={`text-sm font-bold ${health?.services.redis !== 'ok' ? 'text-red-600' : 'text-green-700'}`}>
            {health?.services.redis === 'ok' ? 'Operational' : 'Error'}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-green-800 font-semibold flex items-center gap-1.5">Server Load</span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-green-700">32%</span>
            <div className="sparkline-mock"></div>
          </div>
        </div>
      </div>

      {/* Charts & Lists Grid Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.5fr] gap-6">
        {/* Sales Overview */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-base font-bold m-0">Sales Overview</h3>
            <button className="bg-white border border-slate-200 px-3 py-1 rounded-md text-xs font-semibold text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors">This Month</button>
          </div>
          <div className="relative">
            <span className="text-sm text-slate-500 font-medium mb-2 block">Total Sales</span>
            <div className="flex items-center gap-3 text-2xl font-extrabold mb-5">
              ₹24,85,320
              <span className="text-sm text-green-600 font-bold flex items-center"><ArrowUp size={16} /> 28.4% <span className="text-slate-400 font-normal ml-1">vs last month</span></span>
            </div>
            
            <div className="sales-chart-img"></div>
            
            <div className="flex justify-between text-center pt-4">
              <div className="flex flex-col">
                <strong className="text-base font-bold">₹8,45,210</strong>
                <span className="text-xs text-slate-500">This Week</span>
              </div>
              <div className="flex flex-col">
                <strong className="text-base font-bold">₹2,35,640</strong>
                <span className="text-xs text-slate-500">Today</span>
              </div>
              <div className="flex flex-col">
                <strong className="text-base font-bold">12,458</strong>
                <span className="text-xs text-slate-500">Orders</span>
              </div>
              <div className="flex flex-col">
                <strong className="text-base font-bold">₹278</strong>
                <span className="text-xs text-slate-500">Avg. Order Value</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-base font-bold m-0">Recent Orders</h3>
            <button className="bg-white border border-slate-200 px-3 py-1 rounded-md text-xs font-semibold text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors">View All</button>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-50 last:border-0 last:pb-0">
              <div className="flex items-center gap-3 w-[40%]">
                <span className="text-xs text-slate-500">#ORD12548</span>
                <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                <span className="text-sm font-semibold">Karthik R.</span>
              </div>
              <span className="text-sm font-semibold w-[20%] text-left">₹1,250</span>
              <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">Delivered</span>
              <span className="text-xs text-slate-400 w-[20%] text-right">2 mins ago</span>
            </div>
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-50 last:border-0 last:pb-0">
              <div className="flex items-center gap-3 w-[40%]">
                <span className="text-xs text-slate-500">#ORD12547</span>
                <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                <span className="text-sm font-semibold">Priya S.</span>
              </div>
              <span className="text-sm font-semibold w-[20%] text-left">₹850</span>
              <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">Processing</span>
              <span className="text-xs text-slate-400 w-[20%] text-right">10 mins ago</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-50 last:border-0 last:pb-0">
              <div className="flex items-center gap-3 w-[40%]">
                <span className="text-xs text-slate-500">#ORD12546</span>
                <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                <span className="text-sm font-semibold">Arun M.</span>
              </div>
              <span className="text-sm font-semibold w-[20%] text-left">₹1,560</span>
              <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">Shipped</span>
              <span className="text-xs text-slate-400 w-[20%] text-right">25 mins ago</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-50 last:border-0 last:pb-0">
              <div className="flex items-center gap-3 w-[40%]">
                <span className="text-xs text-slate-500">#ORD12545</span>
                <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                <span className="text-sm font-semibold">Meena K.</span>
              </div>
              <span className="text-sm font-semibold w-[20%] text-left">₹620</span>
              <span className="px-2 py-1 rounded text-xs font-semibold bg-orange-100 text-orange-800">Pending</span>
              <span className="text-xs text-slate-400 w-[20%] text-right">45 mins ago</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-50 last:border-0 last:pb-0">
              <div className="flex items-center gap-3 w-[40%]">
                <span className="text-xs text-slate-500">#ORD12544</span>
                <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                <span className="text-sm font-semibold">Suresh B.</span>
              </div>
              <span className="text-sm font-semibold w-[20%] text-left">₹980</span>
              <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">Delivered</span>
              <span className="text-xs text-slate-400 w-[20%] text-right">1 hour ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Lists Grid Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.5fr] gap-6">
        {/* Top Categories */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-base font-bold m-0">Top Categories</h3>
            <button className="bg-white border border-slate-200 px-3 py-1 rounded-md text-xs font-semibold text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors">View All</button>
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 w-[35%]">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-red-500"><Apple size={16} /></div>
                <span className="text-sm font-semibold">Fruits & Vegetables</span>
              </div>
              <div className="flex-1 h-2 bg-slate-100 rounded-full mx-4 overflow-hidden"><div className="h-full bg-green-500 rounded-full w-full"></div></div>
              <span className="text-xs text-slate-500 w-[20%] text-right">1,245 Orders</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 w-[35%]">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-blue-500"><Milk size={16} /></div>
                <span className="text-sm font-semibold">Dairy & Bakery</span>
              </div>
              <div className="flex-1 h-2 bg-slate-100 rounded-full mx-4 overflow-hidden"><div className="h-full bg-green-500 rounded-full w-[80%]"></div></div>
              <span className="text-xs text-slate-500 w-[20%] text-right">987 Orders</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 w-[35%]">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-emerald-500"><PackageSearch size={16} /></div>
                <span className="text-sm font-semibold">Groceries & Staples</span>
              </div>
              <div className="flex-1 h-2 bg-slate-100 rounded-full mx-4 overflow-hidden"><div className="h-full bg-green-500 rounded-full w-[65%]"></div></div>
              <span className="text-xs text-slate-500 w-[20%] text-right">856 Orders</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 w-[35%]">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-amber-500"><CupSoda size={16} /></div>
                <span className="text-sm font-semibold">Beverages</span>
              </div>
              <div className="flex-1 h-2 bg-slate-100 rounded-full mx-4 overflow-hidden"><div className="h-full bg-green-500 rounded-full w-[45%]"></div></div>
              <span className="text-xs text-slate-500 w-[20%] text-right">642 Orders</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 w-[35%]">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-purple-500"><Cookie size={16} /></div>
                <span className="text-sm font-semibold">Snacks & Branded</span>
              </div>
              <div className="flex-1 h-2 bg-slate-100 rounded-full mx-4 overflow-hidden"><div className="h-full bg-green-500 rounded-full w-[30%]"></div></div>
              <span className="text-xs text-slate-500 w-[20%] text-right">528 Orders</span>
            </div>
          </div>
        </div>

        {/* Top Vendors */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-base font-bold m-0">Top Vendors</h3>
            <button className="bg-white border border-slate-200 px-3 py-1 rounded-md text-xs font-semibold text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors">View All</button>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="text-xs text-slate-500 font-normal pb-3 border-b border-slate-200">Vendor</th>
                  <th className="text-xs text-slate-500 font-normal pb-3 border-b border-slate-200">Orders</th>
                  <th className="text-xs text-slate-500 font-normal pb-3 border-b border-slate-200">Revenue</th>
                  <th className="text-xs text-slate-500 font-normal pb-3 border-b border-slate-200">Rating</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-slate-50 last:border-0">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2 font-semibold">
                      <div className="w-7 h-7 bg-slate-100 rounded-md flex items-center justify-center text-blue-500"><Store size={14} /></div>
                      Fresh Mart
                    </div>
                  </td>
                  <td className="py-3 pr-4">1,245</td>
                  <td className="py-3 pr-4 font-medium text-slate-600">₹3,45,210</td>
                  <td className="py-3"><span className="inline-flex items-center gap-1 font-semibold text-slate-700">4.8 <Star size={12} fill="#eab308" color="#eab308"/></span></td>
                </tr>
                <tr className="border-b border-slate-50 last:border-0">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2 font-semibold">
                      <div className="w-7 h-7 bg-slate-100 rounded-md flex items-center justify-center text-emerald-500"><Store size={14} /></div>
                      Green Basket
                    </div>
                  </td>
                  <td className="py-3 pr-4">987</td>
                  <td className="py-3 pr-4 font-medium text-slate-600">₹2,85,640</td>
                  <td className="py-3"><span className="inline-flex items-center gap-1 font-semibold text-slate-700">4.7 <Star size={12} fill="#eab308" color="#eab308"/></span></td>
                </tr>
                <tr className="border-b border-slate-50 last:border-0">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2 font-semibold">
                      <div className="w-7 h-7 bg-slate-100 rounded-md flex items-center justify-center text-amber-500"><Store size={14} /></div>
                      Daily Needs
                    </div>
                  </td>
                  <td className="py-3 pr-4">856</td>
                  <td className="py-3 pr-4 font-medium text-slate-600">₹2,15,320</td>
                  <td className="py-3"><span className="inline-flex items-center gap-1 font-semibold text-slate-700">4.6 <Star size={12} fill="#eab308" color="#eab308"/></span></td>
                </tr>
                <tr className="border-b border-slate-50 last:border-0">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2 font-semibold">
                      <div className="w-7 h-7 bg-slate-100 rounded-md flex items-center justify-center text-red-500"><Store size={14} /></div>
                      Super Store
                    </div>
                  </td>
                  <td className="py-3 pr-4">642</td>
                  <td className="py-3 pr-4 font-medium text-slate-600">₹1,65,980</td>
                  <td className="py-3"><span className="inline-flex items-center gap-1 font-semibold text-slate-700">4.5 <Star size={12} fill="#eab308" color="#eab308"/></span></td>
                </tr>
                <tr className="border-b border-slate-50 last:border-0">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2 font-semibold">
                      <div className="w-7 h-7 bg-slate-100 rounded-md flex items-center justify-center text-purple-500"><Store size={14} /></div>
                      Quick Shop
                    </div>
                  </td>
                  <td className="py-3 pr-4">528</td>
                  <td className="py-3 pr-4 font-medium text-slate-600">₹1,25,430</td>
                  <td className="py-3"><span className="inline-flex items-center gap-1 font-semibold text-slate-700">4.4 <Star size={12} fill="#eab308" color="#eab308"/></span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
