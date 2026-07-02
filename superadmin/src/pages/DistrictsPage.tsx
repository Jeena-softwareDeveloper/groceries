import { useEffect, useState } from 'react';
import { api, type ApiResponse } from '../api/client';

interface District {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  _count?: { areas: number };
}

export default function DistrictsPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    api
      .get<ApiResponse<District[]>>('/admin/districts')
      .then((res) => setDistricts(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/admin/districts', { name, code, isActive: true });
    setName('');
    setCode('');
    load();
  };

  return (
    <div>
      <h1>Districts</h1>
      <p className="page-desc">Manage geographic districts</p>

      <form className="inline-form" onSubmit={handleCreate}>
        <input placeholder="District name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Code (e.g. CHN)" value={code} onChange={(e) => setCode(e.target.value)} required />
        <button type="submit">Add District</button>
      </form>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Areas</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {districts.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>{d.code}</td>
                <td>{d._count?.areas ?? 0}</td>
                <td>{d.isActive ? 'Active' : 'Inactive'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
