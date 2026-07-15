import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerApi, setLocation } from '../api';

export default function LocationPage() {
  const navigate = useNavigate();
  const [districts, setDistricts] = useState<Array<{ id: string; name: string }>>([]);
  const [areas, setAreas] = useState<Array<{ id: string; name: string }>>([]);
  const [districtId, setDistrictId] = useState('');
  const [areaId, setAreaId] = useState('');

  useEffect(() => {
    customerApi.listDistricts().then((d) => {
      setDistricts(d);
      if (d[0]) setDistrictId(d[0].id);
    });
  }, []);

  useEffect(() => {
    if (!districtId) return;
    customerApi.listAreas(districtId).then(setAreas);
  }, [districtId]);

  const handleSave = () => {
    const district = districts.find((d) => d.id === districtId);
    const area = areas.find((a) => a.id === areaId);
    if (!district) return;
    setLocation(districtId, areaId || undefined, district.name, area?.name);
    navigate('/');
  };

  return (
    <div className="page-container mx-auto max-w-md py-12">
      <h1 className="mb-6 text-2xl font-bold">Choose delivery location</h1>
      <label className="mb-4 block">
        <span className="mb-1 block text-sm font-medium">District</span>
        <select className="w-full rounded-lg border px-3 py-2" value={districtId} onChange={(e) => setDistrictId(e.target.value)}>
          {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </label>
      <label className="mb-6 block">
        <span className="mb-1 block text-sm font-medium">Area</span>
        <select className="w-full rounded-lg border px-3 py-2" value={areaId} onChange={(e) => setAreaId(e.target.value)}>
          <option value="">All areas</option>
          {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </label>
      <button type="button" className="btn-primary w-full" onClick={handleSave}>Continue shopping</button>
    </div>
  );
}
