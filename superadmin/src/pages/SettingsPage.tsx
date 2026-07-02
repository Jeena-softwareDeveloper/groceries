import { useEffect, useState } from 'react';
import { api, type ApiResponse } from '../api/client';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [minOrder, setMinOrder] = useState('99');
  const [tax, setTax] = useState('5');

  useEffect(() => {
    api.get<ApiResponse<Record<string, unknown>>>('/admin/settings').then((res) => {
      setSettings(res.data.data);
      setMinOrder(String(res.data.data.minOrderValue ?? 99));
      setTax(String(res.data.data.taxPercent ?? 5));
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.put<ApiResponse<Record<string, unknown>>>('/admin/settings', {
      minOrderValue: Number(minOrder),
      taxPercent: Number(tax),
    });
    setSettings(res.data.data);
  };

  return (
    <div>
      <h1>App Settings</h1>
      <p className="page-desc">Platform-wide configuration</p>

      <form className="settings-form" onSubmit={handleSave}>
        <label>
          Minimum Order Value (₹)
          <input type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} />
        </label>
        <label>
          Tax Percent (%)
          <input type="number" value={tax} onChange={(e) => setTax(e.target.value)} />
        </label>
        <button type="submit">Save Settings</button>
      </form>

      <pre className="settings-preview">{JSON.stringify(settings, null, 2)}</pre>
    </div>
  );
}
