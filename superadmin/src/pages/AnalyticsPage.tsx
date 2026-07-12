import { 
  Calendar, 
  Download,
  Wallet,
  ShoppingBag,
  Users,
  Store,
  IndianRupee,
  ArrowUp,
  Apple,
  Milk,
  PackageSearch,
  CupSoda,
  Cookie,
  MapPin,
  Banknote,
  Smartphone,
  CreditCard
} from 'lucide-react';
import './AnalyticsPage.css';

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 m-0 mb-1">Analytics Overview</h1>
          <p className="text-sm text-slate-500 m-0">Track key performance metrics and insights of your marketplace</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-slate-200 bg-white rounded-lg px-4 py-2 text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors">
            <Calendar size={16} /> 12 Jul 2025 - 12 Aug 2025 <span className="text-[10px]">▼</span>
          </div>
          <button className="flex items-center gap-2 border-2 border-emerald-600 text-emerald-600 bg-white rounded-lg px-4 py-2 text-sm font-bold hover:bg-emerald-50 transition-colors">
            <Download size={16} /> Export Report
          </button>
        </div>
      </div>

      {/* Row 1: KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Card 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 relative overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-100 text-green-600">
              <Wallet size={16} />
            </div>
            <span className="text-xs font-semibold text-slate-600">Total Revenue</span>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 m-0 mb-1">₹24,85,320</h3>
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <span className="flex items-center text-green-600 font-bold"><ArrowUp size={10} /> 28.4%</span> vs last 30 days
          </div>
          <div className="absolute bottom-0 left-0 w-full h-6">
             <svg preserveAspectRatio="none" className="w-full h-full"><path d="M0,24 L10,20 L30,22 L50,15 L70,18 L90,10 L100,5 L100,24 L0,24 Z" fill="rgba(34,197,94,0.1)" /><path d="M0,24 L10,20 L30,22 L50,15 L70,18 L90,10 L100,5" fill="none" stroke="#16a34a" strokeWidth="2" /></svg>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 relative overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600">
              <ShoppingBag size={16} />
            </div>
            <span className="text-xs font-semibold text-slate-600">Total Orders</span>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 m-0 mb-1">8,942</h3>
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <span className="flex items-center text-green-600 font-bold"><ArrowUp size={10} /> 22.7%</span> vs last 30 days
          </div>
          <div className="absolute bottom-0 left-0 w-full h-6">
             <svg preserveAspectRatio="none" className="w-full h-full"><path d="M0,24 L20,18 L40,20 L60,10 L80,12 L100,5 L100,24 L0,24 Z" fill="rgba(37,99,235,0.1)" /><path d="M0,24 L20,18 L40,20 L60,10 L80,12 L100,5" fill="none" stroke="#2563eb" strokeWidth="2" /></svg>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 relative overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-100 text-purple-600">
              <Users size={16} />
            </div>
            <span className="text-xs font-semibold text-slate-600">Total Customers</span>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 m-0 mb-1">24,568</h3>
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <span className="flex items-center text-green-600 font-bold"><ArrowUp size={10} /> 18.3%</span> vs last 30 days
          </div>
          <div className="absolute bottom-0 left-0 w-full h-6">
             <svg preserveAspectRatio="none" className="w-full h-full"><path d="M0,24 L10,22 L30,18 L50,19 L70,10 L90,12 L100,5 L100,24 L0,24 Z" fill="rgba(147,51,234,0.1)" /><path d="M0,24 L10,22 L30,18 L50,19 L70,10 L90,12 L100,5" fill="none" stroke="#9333ea" strokeWidth="2" /></svg>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 relative overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-100 text-orange-600">
              <Store size={16} />
            </div>
            <span className="text-xs font-semibold text-slate-600">Total Vendors</span>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 m-0 mb-1">156</h3>
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <span className="flex items-center text-green-600 font-bold"><ArrowUp size={10} /> 15.2%</span> vs last 30 days
          </div>
          <div className="absolute bottom-0 left-0 w-full h-6">
             <svg preserveAspectRatio="none" className="w-full h-full"><path d="M0,24 L20,20 L40,15 L60,18 L80,8 L100,5 L100,24 L0,24 Z" fill="rgba(234,88,12,0.1)" /><path d="M0,24 L20,20 L40,15 L60,18 L80,8 L100,5" fill="none" stroke="#ea580c" strokeWidth="2" /></svg>
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 relative overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal-100 text-teal-600">
              <IndianRupee size={16} />
            </div>
            <span className="text-xs font-semibold text-slate-600">Average Order Value</span>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 m-0 mb-1">₹278</h3>
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <span className="flex items-center text-green-600 font-bold"><ArrowUp size={10} /> 12.6%</span> vs last 30 days
          </div>
          <div className="absolute bottom-0 left-0 w-full h-6">
             <svg preserveAspectRatio="none" className="w-full h-full"><path d="M0,24 L20,22 L40,18 L60,20 L80,10 L100,5 L100,24 L0,24 Z" fill="rgba(13,148,136,0.1)" /><path d="M0,24 L20,22 L40,18 L60,20 L80,10 L100,5" fill="none" stroke="#0d9488" strokeWidth="2" /></svg>
          </div>
        </div>
      </div>

      {/* Row 2: Revenue Line Chart & Orders Donut Chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-900 m-0">Revenue Overview</h3>
            <select className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-xs text-slate-600 outline-none"><option>This Month</option></select>
          </div>
          <div className="mb-6">
            <span className="text-xs text-slate-500 block mb-1">Total Revenue</span>
            <div className="flex items-center gap-4 text-3xl font-extrabold text-slate-900">
              ₹24,85,320
              <span className="flex items-center text-sm text-green-600 font-bold"><ArrowUp size={16} className="mr-1"/> 28.4% <span className="text-slate-400 font-medium text-xs ml-1">vs last month</span></span>
            </div>
          </div>
          <div className="rev-chart-mock mb-8"></div>
          <div className="flex justify-between border-t border-slate-200 pt-6 mt-10">
            <div className="text-center">
              <strong className="block text-lg font-extrabold text-slate-900">₹8,45,210</strong>
              <span className="text-xs text-slate-500">This Week</span>
            </div>
            <div className="text-center">
              <strong className="block text-lg font-extrabold text-slate-900">₹2,35,640</strong>
              <span className="text-xs text-slate-500">Today</span>
            </div>
            <div className="text-center">
              <strong className="block text-lg font-extrabold text-slate-900">8,942</strong>
              <span className="text-xs text-slate-500">Orders</span>
            </div>
            <div className="text-center">
              <strong className="block text-lg font-extrabold text-slate-900">₹278</strong>
              <span className="text-xs text-slate-500">Avg. Order Value</span>
            </div>
            <div className="text-center">
              <strong className="block text-lg font-extrabold text-slate-900">5.6%</strong>
              <span className="text-xs text-slate-500">Cancellation Rate</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-900 m-0">Orders Overview</h3>
            <select className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-xs text-slate-600 outline-none"><option>This Month</option></select>
          </div>
          <div className="flex flex-col items-center justify-center h-[300px]">
            <div className="donut-chart mb-6">
              <div className="donut-inner">
                <strong className="text-2xl font-extrabold text-slate-900">8,942</strong>
                <span className="text-xs text-slate-500">Total Orders</span>
              </div>
            </div>
            <div className="w-full">
              <div className="flex items-center justify-between mb-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-green-600"></span> Delivered</div>
                <div><span className="font-semibold text-slate-900">5,124</span> <span className="text-slate-400 font-normal ml-1">(57.3%)</span></div>
              </div>
              <div className="flex items-center justify-between mb-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> Processing</div>
                <div><span className="font-semibold text-slate-900">1,842</span> <span className="text-slate-400 font-normal ml-1">(20.6%)</span></div>
              </div>
              <div className="flex items-center justify-between mb-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Shipped</div>
                <div><span className="font-semibold text-slate-900">1,256</span> <span className="text-slate-400 font-normal ml-1">(14.0%)</span></div>
              </div>
              <div className="flex items-center justify-between mb-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Pending</div>
                <div><span className="font-semibold text-slate-900">720</span> <span className="text-slate-400 font-normal ml-1">(8.1%)</span></div>
              </div>
            </div>
          </div>
          <a href="#" className="block mt-4 text-xs font-medium text-blue-500 no-underline hover:underline">View full orders report →</a>
        </div>
      </div>

      {/* Row 3: Revenue Trend Bar Chart & Top Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-900 m-0">Revenue Trend</h3>
            <select className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-xs text-slate-600 outline-none"><option>Last 6 Months</option></select>
          </div>
          <div className="flex items-end justify-between h-[200px] border-b border-l border-slate-200 pb-2.5 pl-2.5 relative ml-10">
            <div className="absolute -left-10 h-full flex flex-col justify-between text-[10px] text-slate-400 pb-2.5">
              <span>₹30L</span>
              <span>₹20L</span>
              <span>₹10L</span>
              <span>₹0</span>
            </div>
            <div className="flex flex-col items-center gap-2 w-[12%] relative">
              <div className="w-full bg-green-600 rounded-t-sm transition-colors hover:bg-green-700 h-[50%]"></div>
              <span className="text-[10px] text-slate-500 absolute -bottom-6 whitespace-nowrap">Mar 2025</span>
            </div>
            <div className="flex flex-col items-center gap-2 w-[12%] relative">
              <div className="w-full bg-green-600 rounded-t-sm transition-colors hover:bg-green-700 h-[55%]"></div>
              <span className="text-[10px] text-slate-500 absolute -bottom-6 whitespace-nowrap">Apr 2025</span>
            </div>
            <div className="flex flex-col items-center gap-2 w-[12%] relative">
              <div className="w-full bg-green-600 rounded-t-sm transition-colors hover:bg-green-700 h-[55%]"></div>
              <span className="text-[10px] text-slate-500 absolute -bottom-6 whitespace-nowrap">May 2025</span>
            </div>
            <div className="flex flex-col items-center gap-2 w-[12%] relative">
              <div className="w-full bg-green-600 rounded-t-sm transition-colors hover:bg-green-700 h-[65%]"></div>
              <span className="text-[10px] text-slate-500 absolute -bottom-6 whitespace-nowrap">Jun 2025</span>
            </div>
            <div className="flex flex-col items-center gap-2 w-[12%] relative">
              <div className="w-full bg-green-600 rounded-t-sm transition-colors hover:bg-green-700 h-[70%]"></div>
              <span className="text-[10px] text-slate-500 absolute -bottom-6 whitespace-nowrap">Jul 2025</span>
            </div>
            <div className="flex flex-col items-center gap-2 w-[12%] relative">
              <div className="bar-tooltip absolute -top-11 bg-slate-900 text-white px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap pointer-events-none z-10">
                <div className="text-[10px] font-medium text-slate-400 mb-0.5">Aug 2025</div>
                ₹24,85,320
              </div>
              <div className="w-full bg-green-600 rounded-t-sm transition-colors hover:bg-green-700 h-[82%]"></div>
              <span className="text-[10px] text-slate-500 absolute -bottom-6 whitespace-nowrap">Aug 2025</span>
            </div>
          </div>
          <div className="flex justify-center items-center gap-2 mt-8 text-xs text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-green-600"></span> Revenue (₹)
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-900 m-0">Top Categories by Revenue</h3>
            <select className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-xs text-slate-600 outline-none"><option>This Month</option></select>
          </div>
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 w-[35%]">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-orange-600"><Apple size={16} /></div>
                <span className="text-sm font-semibold text-slate-900">Fruits & Vegetables</span>
              </div>
              <div className="flex-1 flex items-center gap-4 ml-4">
                <div className="flex-1 h-2 bg-slate-100 rounded-sm overflow-hidden"><div className="h-full bg-green-600 rounded-sm w-full"></div></div>
                <span className="text-sm font-semibold text-slate-600 w-[70px] text-right">₹6,45,210</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 w-[35%]">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-blue-500"><Milk size={16} /></div>
                <span className="text-sm font-semibold text-slate-900">Dairy & Bakery</span>
              </div>
              <div className="flex-1 flex items-center gap-4 ml-4">
                <div className="flex-1 h-2 bg-slate-100 rounded-sm overflow-hidden"><div className="h-full bg-green-600 rounded-sm w-[80%]"></div></div>
                <span className="text-sm font-semibold text-slate-600 w-[70px] text-right">₹4,82,110</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 w-[35%]">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-blue-500"><PackageSearch size={16} /></div>
                <span className="text-sm font-semibold text-slate-900">Groceries & Staples</span>
              </div>
              <div className="flex-1 flex items-center gap-4 ml-4">
                <div className="flex-1 h-2 bg-slate-100 rounded-sm overflow-hidden"><div className="h-full bg-green-600 rounded-sm w-[65%]"></div></div>
                <span className="text-sm font-semibold text-slate-600 w-[70px] text-right">₹4,25,340</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 w-[35%]">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-purple-600"><CupSoda size={16} /></div>
                <span className="text-sm font-semibold text-slate-900">Beverages</span>
              </div>
              <div className="flex-1 flex items-center gap-4 ml-4">
                <div className="flex-1 h-2 bg-slate-100 rounded-sm overflow-hidden"><div className="h-full bg-green-600 rounded-sm w-[45%]"></div></div>
                <span className="text-sm font-semibold text-slate-600 w-[70px] text-right">₹2,65,880</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 w-[35%]">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-teal-600"><Cookie size={16} /></div>
                <span className="text-sm font-semibold text-slate-900">Snacks & Branded Foods</span>
              </div>
              <div className="flex-1 flex items-center gap-4 ml-4">
                <div className="flex-1 h-2 bg-slate-100 rounded-sm overflow-hidden"><div className="h-full bg-green-600 rounded-sm w-[35%]"></div></div>
                <span className="text-sm font-semibold text-slate-600 w-[70px] text-right">₹2,10,780</span>
              </div>
            </div>
          </div>
          <a href="#" className="block mt-6 text-xs font-medium text-blue-500 no-underline hover:underline">View full report →</a>
        </div>
      </div>

      {/* Row 4: Small Lists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Top Vendors */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-slate-900 m-0">Top Vendors</h3>
            <a href="#" className="text-xs font-medium text-blue-500 no-underline hover:underline">View All</a>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-slate-100 rounded-md flex items-center justify-center text-blue-500"><Store size={14}/></div>
                <span className="text-sm font-semibold text-slate-900">Fresh Mart</span>
              </div>
              <div className="text-sm text-slate-600">₹3,45,210</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-slate-100 rounded-md flex items-center justify-center text-green-600"><Store size={14}/></div>
                <span className="text-sm font-semibold text-slate-900">Green Basket</span>
              </div>
              <div className="text-sm text-slate-600">₹2,85,640</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-slate-100 rounded-md flex items-center justify-center text-orange-600"><Store size={14}/></div>
                <span className="text-sm font-semibold text-slate-900">Daily Needs</span>
              </div>
              <div className="text-sm text-slate-600">₹2,15,320</div>
            </div>
          </div>
        </div>

        {/* Top Areas */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-slate-900 m-0">Top Areas by Orders</h3>
            <a href="#" className="text-xs font-medium text-blue-500 no-underline hover:underline">View All</a>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-slate-100 rounded-md flex items-center justify-center"><MapPin size={14}/></div>
                <span className="text-sm font-semibold text-slate-900">Koramangala</span>
              </div>
              <div className="text-sm font-semibold text-slate-900">1,245</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-slate-100 rounded-md flex items-center justify-center"><MapPin size={14}/></div>
                <span className="text-sm font-semibold text-slate-900">HSR Layout</span>
              </div>
              <div className="text-sm font-semibold text-slate-900">987</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-slate-100 rounded-md flex items-center justify-center"><MapPin size={14}/></div>
                <span className="text-sm font-semibold text-slate-900">Indiranagar</span>
              </div>
              <div className="text-sm font-semibold text-slate-900">856</div>
            </div>
          </div>
        </div>

        {/* Top Payment Methods */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-slate-900 m-0">Top Payment Methods</h3>
            <a href="#" className="text-xs font-medium text-blue-500 no-underline hover:underline">View All</a>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-slate-100 rounded-md flex items-center justify-center"><Smartphone size={14}/></div>
                <span className="text-sm font-semibold text-slate-900">UPI</span>
              </div>
              <div className="text-sm font-semibold text-slate-900">62.4%</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-slate-100 rounded-md flex items-center justify-center"><Banknote size={14}/></div>
                <span className="text-sm font-semibold text-slate-900">COD</span>
              </div>
              <div className="text-sm font-semibold text-slate-900">28.7%</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-slate-100 rounded-md flex items-center justify-center"><CreditCard size={14}/></div>
                <span className="text-sm font-semibold text-slate-900">Wallet</span>
              </div>
              <div className="text-sm font-semibold text-slate-900">8.9%</div>
            </div>
          </div>
        </div>

        {/* New Customers */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-slate-900 m-0">New Customers</h3>
            <a href="#" className="text-xs font-medium text-blue-500 no-underline hover:underline">View All</a>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 mb-2">2,456</div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-4">
              <span className="flex items-center text-green-600 font-bold"><ArrowUp size={10} /> 18.3%</span> vs last 30 days
            </div>
            <div className="relative h-6">
               <svg preserveAspectRatio="none" className="w-full h-full"><path d="M0,24 L20,18 L40,20 L60,10 L80,12 L100,5 L100,24 L0,24 Z" fill="rgba(34,197,94,0.1)" /><path d="M0,24 L20,18 L40,20 L60,10 L80,12 L100,5" fill="none" stroke="#16a34a" strokeWidth="2" /></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
