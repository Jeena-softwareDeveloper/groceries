import { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vendorRequestApi } from '../api/vendor-request.api';
import {
  LayoutDashboard, MapPin, Map, Grid, Store, Image, Layers, Truck, Tag, Ticket, BarChart3, Users, Bell, Settings, LogOut, ShoppingBasket, Search, HelpCircle, Menu, ChevronDown, ClipboardList
} from 'lucide-react';



const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/districts', label: 'Districts', icon: Map },
  { path: '/areas', label: 'Areas', icon: MapPin },
  { path: '/categories', label: 'Categories', icon: Grid },
  { path: '/vendors', label: 'Vendors', icon: Store },
  { path: '/vendor-requests', label: 'Vendor Requests', icon: ClipboardList, badge: true },
  { path: '/product-approvals', label: 'Product Approvals', icon: ClipboardList },
  { path: '/banners', label: 'Banners', icon: Image },
  { path: '/micro-banners', label: 'Micro Banners', icon: Layers },
  { path: '/delivery-charges', label: 'Delivery', icon: Truck },
  { path: '/offers', label: 'Offers', icon: Tag },
  { path: '/coupons', label: 'Coupons', icon: Ticket },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/settings', label: 'Settings', icon: Settings },
];


export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    vendorRequestApi.getPendingCount()
      .then((r: any) => setPendingCount(r?.data?.count ?? 0))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-[260px] bg-[#0d3d25] text-white flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3 shrink-0">
          <div className="bg-green-600 p-1.5 rounded-lg flex items-center justify-center">
            <ShoppingBasket size={24} color="#ffffff" />
          </div>
          <div className="flex flex-col">
            <h2 className="m-0 text-lg font-bold tracking-wide">DistrictMart</h2>
            <span className="text-[10px] text-slate-300 uppercase">Super Admin</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <nav className="flex flex-col px-3 gap-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const showBadge = (item as any).badge && pendingCount > 0;
              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors no-underline ${isActive ? 'bg-green-600 text-white' : 'text-slate-200 hover:bg-white/10'}`}
                >
                  <Icon size={18} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {showBadge && (
                    <span style={{ background: '#dc2626', color: '#fff', borderRadius: 999, padding: '1px 7px', fontSize: 11, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>
                      {pendingCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="m-6 shrink-0 bg-gradient-to-b from-[#104a2d] to-[#0d3d25] border border-white/10 rounded-xl p-5 text-left relative overflow-hidden">
            <Store size={40} className="absolute -top-2 left-0 right-0 opacity-10 pointer-events-none" />
            <h4 className="m-0 mb-2 text-sm font-bold relative z-10">Grow your marketplace</h4>
            <p className="m-0 mb-4 text-xs text-slate-300 leading-snug relative z-10">Add more vendors and increase your reach.</p>
            <button type="button" className="w-full bg-green-600 text-white border-none py-2 rounded-md text-xs font-semibold cursor-pointer relative z-10 hover:bg-green-700 transition-colors">
              View Analytics
            </button>
          </div>
        </div>

        <div className="mx-4 mb-6 pt-4 shrink-0 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-200 text-green-800 rounded-full flex items-center justify-center font-bold text-sm">SA</div>
            <div className="flex flex-col">
              <strong className="text-sm font-semibold">Super Admin</strong>
              <span className="text-[10px] text-slate-300">{user?.email || 'admin@districtmart.com'}</span>
            </div>
          </div>
          <button type="button" onClick={handleLogout} className="bg-transparent border-none text-slate-300 cursor-pointer p-1 rounded-md flex items-center hover:bg-white/10 hover:text-white transition-colors" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button className="bg-transparent border-none text-slate-600 cursor-pointer p-1 hidden md:block">
              <Menu size={24} />
            </button>
          </div>

          <div className="flex-1 max-w-[480px] mx-8">
            <div className="relative flex items-center">
              <Search size={18} className="absolute left-3 text-slate-400" />
              <input type="text" placeholder="Search anything..." className="w-full bg-slate-50 border border-slate-200 py-2.5 pl-10 pr-3 rounded-lg text-sm outline-none transition-all focus:border-green-600 focus:bg-white focus:ring-[3px] focus:ring-green-600/10" />
              <span className="absolute right-3 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] text-slate-400 font-semibold">Ctrl + K</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button className="bg-transparent border-none text-slate-600 cursor-pointer relative p-1 hover:text-slate-900">
              <Bell size={20} />
              <span className="absolute top-0.5 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="bg-transparent border-none text-slate-600 cursor-pointer relative p-1 hover:text-slate-900">
              <HelpCircle size={20} />
            </button>
            
            <div className="flex items-center gap-3 cursor-pointer p-1 px-2 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="w-8 h-8 bg-green-200 text-green-800 rounded-full flex items-center justify-center font-bold text-sm">SA</div>
              <div className="flex flex-col">
                <strong className="text-sm text-slate-900">Super Admin</strong>
                <span className="text-xs text-slate-500">Super Admin</span>
              </div>
              <ChevronDown size={16} className="text-slate-500" />
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
