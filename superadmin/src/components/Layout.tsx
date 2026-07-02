import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>DistrictMart</h2>
        <p className="sidebar-role">Super Admin</p>
        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/districts">Districts</Link>
          <Link to="/areas">Areas</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/vendors">Vendors</Link>
          <Link to="/banners">Banners</Link>
          <Link to="/micro-banners">Micro Banners</Link>
          <Link to="/delivery-charges">Delivery</Link>
          <Link to="/offers">Offers</Link>
          <Link to="/coupons">Coupons</Link>
          <Link to="/analytics">Analytics</Link>
          <Link to="/customers">Customers</Link>
          <Link to="/notifications">Notifications</Link>
          <Link to="/settings">Settings</Link>
        </nav>
        <div className="sidebar-footer">
          <p>{user?.name}</p>
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
