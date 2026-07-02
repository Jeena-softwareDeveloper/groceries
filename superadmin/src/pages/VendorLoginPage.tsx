import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function VendorLoginPage() {
  const [email, setEmail] = useState('vendor@districtmart.com');
  const [password, setPassword] = useState('Vendor@123');
  const [error, setError] = useState('');
  const { loginVendor } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await loginVendor(email, password);
      navigate('/vendor');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } }; message?: string })?.response
          ?.data?.error?.message ??
        (err as { message?: string })?.message ??
        'Invalid credentials or vendor not approved';
      setError(msg.includes('Network') || msg.includes('404') ? 'Cannot reach API — use http://127.0.0.1:3000' : msg);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <p className="badge">Vendor Panel</p>
        <h1>Fresh Mart Login</h1>
        {error && <p className="error">{error}</p>}
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        <button type="submit">Sign In</button>
        <Link to="/login">Super Admin login →</Link>
      </form>
    </div>
  );
}
