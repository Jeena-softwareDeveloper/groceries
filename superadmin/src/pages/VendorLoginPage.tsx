import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Store, ShoppingBasket, Package, BarChart3, ShieldCheck, Mail, Lock, Eye, EyeOff, AlertCircle
} from 'lucide-react';

export default function VendorLoginPage() {
  const [email, setEmail] = useState('vendor@districtmart.com');
  const [password, setPassword] = useState('Vendor@123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginVendor } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginVendor(email, password);
      navigate('/vendor');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } }; message?: string })?.response
          ?.data?.error?.message ??
        (err as { message?: string })?.message ??
        'Invalid credentials or vendor not approved';
      setError(msg.includes('Network') || msg.includes('404') ? 'Cannot reach API — use http://127.0.0.1:4000' : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-slate-50">
      {/* Left Branding Panel (Orange for Vendor) */}
      <div className="flex-1 bg-orange-600 text-white flex flex-col justify-center p-10 md:p-16 relative overflow-hidden">
        <div className="relative z-10 max-w-[480px] mx-auto w-full flex flex-col md:items-start items-center md:text-left text-center">
          <div className="inline-flex bg-orange-500 p-3 rounded-xl mb-5">
            <Store size={40} color="#ffffff" />
          </div>
          <h1 className="text-4xl font-bold m-0 mb-2">DistrictMart</h1>
          <p className="text-lg font-medium m-0 mb-8 opacity-90">Vendor Partner Portal</p>
          
          <div className="h-px bg-white/20 w-full mb-8"></div>
          
          <h2 className="text-2xl font-bold m-0 mb-3">Manage Your Store</h2>
          <p className="text-base leading-relaxed opacity-90 m-0 mb-10">Process orders, update inventory, and grow your local business.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full text-left">
            <div className="flex items-start gap-3">
              <div className="bg-white/20 p-2 rounded-full flex items-center justify-center shrink-0">
                <ShoppingBasket size={20} color="#ffffff" />
              </div>
              <div className="flex flex-col">
                <h4 className="m-0 mb-1 text-sm font-semibold">Order Processing</h4>
                <p className="m-0 text-xs opacity-80">Fulfill local orders</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-white/20 p-2 rounded-full flex items-center justify-center shrink-0">
                <Package size={20} color="#ffffff" />
              </div>
              <div className="flex flex-col">
                <h4 className="m-0 mb-1 text-sm font-semibold">Inventory Tracking</h4>
                <p className="m-0 text-xs opacity-80">Update stock instantly</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-white/20 p-2 rounded-full flex items-center justify-center shrink-0">
                <BarChart3 size={20} color="#ffffff" />
              </div>
              <div className="flex flex-col">
                <h4 className="m-0 mb-1 text-sm font-semibold">Sales Insights</h4>
                <p className="m-0 text-xs opacity-80">Track your earnings</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-white/20 p-2 rounded-full flex items-center justify-center shrink-0">
                <ShieldCheck size={20} color="#ffffff" />
              </div>
              <div className="flex flex-col">
                <h4 className="m-0 mb-1 text-sm font-semibold">Secure Payouts</h4>
                <p className="m-0 text-xs opacity-80">Fast and reliable</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="flex-1 flex items-center justify-center p-10 bg-white">
        <div className="w-full max-w-[440px]">
          <div className="inline-flex items-center gap-1.5 text-orange-600 border border-orange-200 bg-orange-50 px-3 py-1.5 rounded-full text-xs font-bold uppercase mb-6">
            <Store size={16} />
            VENDOR PORTAL
          </div>
          
          <h1 className="text-4xl font-extrabold text-slate-900 m-0 mb-2">Partner <span className="text-orange-600">Login</span></h1>
          <p className="text-slate-500 text-base m-0 mb-6">Sign in to manage your local store</p>

          <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 p-4 rounded-lg text-orange-800 text-sm font-medium mb-8">
            <ShieldCheck size={20} />
            Only approved vendors can access this portal.
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm mb-6">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-900 mb-2">Email Address</label>
              <div className="relative flex items-center">
                <Mail size={18} className="absolute left-3 text-slate-400" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="vendor@districtmart.com"
                  className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg text-base outline-none transition-all focus:border-orange-600 focus:ring-[3px] focus:ring-orange-600/10"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-900 mb-2">Password</label>
              <div className="relative flex items-center">
                <Lock size={18} className="absolute left-3 text-slate-400" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg text-base outline-none transition-all focus:border-orange-600 focus:ring-[3px] focus:ring-orange-600/10"
                />
                <button 
                  type="button" 
                  className="absolute right-3 bg-transparent border-none p-0 cursor-pointer text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-orange-600 cursor-pointer" />
                Remember me
              </label>
              <a href="#" className="text-blue-700 text-sm font-medium no-underline hover:underline">Forgot Password?</a>
            </div>

            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white border-none py-3.5 rounded-lg text-base font-semibold cursor-pointer hover:bg-orange-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed" disabled={loading}>
              <Lock size={18} />
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
            
            <div className="flex items-center text-center my-6 text-slate-400 text-xs font-semibold before:content-[''] before:flex-1 before:border-b before:border-slate-200 before:mr-4 after:content-[''] after:flex-1 after:border-b after:border-slate-200 after:ml-4">OR</div>
            
            <button 
              type="button" 
              className="w-full flex items-center justify-center gap-2 bg-white text-orange-600 border border-slate-200 py-3.5 rounded-lg text-base font-semibold cursor-pointer hover:border-orange-600 hover:bg-orange-50 transition-all"
              onClick={() => window.location.href = '/login'}
            >
              <ShieldCheck size={18} />
              Super Admin Login
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 text-sm">
            <ShieldCheck size={16} className="text-orange-600" />
            Protected by <span className="text-orange-600 font-semibold">advanced security</span>
          </div>
        </div>
      </div>
    </div>
  );
}
