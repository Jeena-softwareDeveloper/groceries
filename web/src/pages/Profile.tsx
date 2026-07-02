import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProfile, updateProfile, type Address } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, logout, setUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProfile()
      .then((profile) => {
        setName(profile.name ?? '');
        setEmail(profile.email ?? '');
        setAddresses(profile.addresses ?? []);
        setUser(profile);
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [setUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await updateProfile({ name: name || undefined, email: email || undefined });
      setUser(updated);
      setMessage('Profile updated successfully');
    } catch {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="page-container pb-20 md:pb-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Profile</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-700">
              {(name || user?.phone || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{name || 'Customer'}</p>
              <p className="text-sm text-gray-500">{user?.phone}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                Email (optional)
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="your@email.com"
              />
            </div>
            {message && <p className="text-sm text-green-600">{message}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="mb-4 font-semibold text-gray-900">Saved Addresses</h2>
            {addresses.length === 0 ? (
              <p className="text-sm text-gray-500">
                No saved addresses. Add one during{' '}
                <Link to="/checkout" className="text-primary-600 hover:underline">
                  checkout
                </Link>
                .
              </p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div key={addr.id} className="rounded-lg border border-gray-200 p-3">
                    <p className="font-medium text-gray-900">
                      {addr.label}
                      {addr.isDefault && (
                        <span className="ml-2 rounded bg-primary-100 px-2 py-0.5 text-xs text-primary-700">
                          Default
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {addr.line1}
                      {addr.line2 ? `, ${addr.line2}` : ''}
                    </p>
                    <p className="text-sm text-gray-600">
                      {addr.city}, {addr.state} — {addr.pincode}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="mb-4 font-semibold text-gray-900">Quick Links</h2>
            <div className="space-y-2">
              <Link
                to="/orders"
                className="block rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
              >
                My Orders
              </Link>
              <Link
                to="/cart"
                className="block rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
              >
                My Cart
              </Link>
            </div>
            <button
              onClick={logout}
              className="mt-4 w-full rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
