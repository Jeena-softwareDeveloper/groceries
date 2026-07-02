import { useEffect, useState } from 'react';
import { api, type ApiResponse } from '../api/client';

interface Area {
  id: string;
  name: string;
  pincode?: string;
  isActive: boolean;
  district: { id: string; name: string };
}

interface District {
  id: string;
  name: string;
}

export default function AreasPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [districtId, setDistrictId] = useState('');
  const [name, setName] = useState('');
  const [pincode, setPincode] = useState('');

  const load = () => {
    api.get<ApiResponse<Area[]>>('/admin/areas').then((res) => setAreas(res.data.data));
    api.get<ApiResponse<District[]>>('/admin/districts').then((res) => {
      setDistricts(res.data.data);
      if (res.data.data[0] && !districtId) setDistrictId(res.data.data[0].id);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/admin/areas', { districtId, name, pincode, isActive: true });
    setName('');
    setPincode('');
    load();
  };

  return (
    <div>
      <h1>Areas</h1>
      <p className="page-desc">Manage areas within districts</p>

      <form className="inline-form" onSubmit={handleCreate}>
        <select value={districtId} onChange={(e) => setDistrictId(e.target.value)} required>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <input placeholder="Area name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
        <button type="submit">Add Area</button>
      </form>

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>District</th>
            <th>Pincode</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {areas.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.district.name}</td>
              <td>{a.pincode ?? '—'}</td>
              <td>{a.isActive ? 'Active' : 'Inactive'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
