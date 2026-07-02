import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  checkout,
  createAddress,
  formatPrice,
  getCart,
  listAddresses,
  type Address,
  type Cart,
} from '../api/client';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'RAZORPAY'>('COD');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: true,
  });

  useEffect(() => {
    Promise.all([getCart(), listAddresses()])
      .then(([cartData, addressData]) => {
        setCart(cartData);
        setAddresses(addressData);
        const defaultAddr = addressData.find((a) => a.isDefault) ?? addressData[0];
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
        if (addressData.length === 0) setShowAddressForm(true);
      })
      .catch(() => setError('Failed to load checkout data'))
      .finally(() => setLoading(false));
  }, []);

  const total =
    cart?.items.reduce(
      (sum, item) => sum + Number(item.product.sellingPrice) * item.quantity,
      0,
    ) ?? 0;

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const addr = await createAddress(newAddress);
      setAddresses((prev) => [...prev, addr]);
      setSelectedAddressId(addr.id);
      setShowAddressForm(false);
    } catch {
      setError('Failed to save address');
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      setError('Please select a delivery address');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await checkout(selectedAddressId, paymentMethod);
      navigate('/orders', { state: { newOrders: result.orders } });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ?? 'Checkout failed';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="page-container text-center">
        <p className="text-gray-500">Your cart is empty</p>
        <Link to="/shops" className="btn-primary mt-4 inline-block">
          Browse Shops
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container pb-20 md:pb-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Checkout</h1>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Delivery Address */}
          <div className="card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Delivery Address</h2>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                {showAddressForm ? 'Cancel' : '+ Add new'}
              </button>
            </div>

            {showAddressForm ? (
              <form onSubmit={handleCreateAddress} className="space-y-3">
                <input
                  className="input-field"
                  placeholder="Label (e.g. Home)"
                  value={newAddress.label}
                  onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                  required
                />
                <input
                  className="input-field"
                  placeholder="Address line 1"
                  value={newAddress.line1}
                  onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                  required
                />
                <input
                  className="input-field"
                  placeholder="Address line 2 (optional)"
                  value={newAddress.line2}
                  onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="input-field"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    required
                  />
                  <input
                    className="input-field"
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    required
                  />
                </div>
                <input
                  className="input-field"
                  placeholder="Pincode"
                  value={newAddress.pincode}
                  onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                  required
                  maxLength={6}
                />
                <button type="submit" className="btn-primary w-full">
                  Save Address
                </button>
              </form>
            ) : (
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                      selectedAddressId === addr.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr.id}
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-1 text-primary-600"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{addr.label}</p>
                      <p className="text-sm text-gray-600">
                        {addr.line1}
                        {addr.line2 ? `, ${addr.line2}` : ''}
                      </p>
                      <p className="text-sm text-gray-600">
                        {addr.city}, {addr.state} — {addr.pincode}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="card">
            <h2 className="mb-4 font-semibold text-gray-900">Payment Method</h2>
            <div className="space-y-2">
              {(['COD', 'RAZORPAY'] as const).map((method) => (
                <label
                  key={method}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${
                    paymentMethod === method
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                    className="text-primary-600"
                  />
                  <span className="font-medium text-gray-900">
                    {method === 'COD' ? 'Cash on Delivery' : 'Online Payment (Razorpay)'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="card">
            <h2 className="mb-4 font-semibold text-gray-900">Order Summary</h2>
            <div className="mb-4 max-h-48 space-y-2 overflow-y-auto text-sm">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-gray-600">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span>{formatPrice(Number(item.product.sellingPrice) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={submitting || !selectedAddressId}
              className="btn-primary mt-6 w-full"
            >
              {submitting ? 'Placing order…' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
