import { useEffect, useState } from 'react';
import { api, type ApiResponse } from '../api/client';

interface Vendor {
  id: string;
  shopName: string;
  email: string;
  status: string;
  area: { name: string; district: { name: string } };
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filter, setFilter] = useState('');

  const load = () => {
    const params = filter ? `?status=${filter}` : '';
    api.get<ApiResponse<Vendor[]>>(`/admin/vendors${params}`).then((res) => setVendors(res.data.data));
  };

  useEffect(() => {
    load();
  }, [filter]);

  const approve = async (id: string) => {
    await api.post(`/admin/vendors/${id}/approve`);
    load();
  };

  const reject = async (id: string) => {
    await api.post(`/admin/vendors/${id}/reject`, { reason: 'Does not meet requirements' });
    load();
  };

  return (
    <div>
      <h1>Vendors</h1>
      <p className="page-desc">Approve, reject, or manage vendor shops</p>

      <div className="filter-bar">
        <button type="button" className={filter === '' ? 'active' : ''} onClick={() => setFilter('')}>
          All
        </button>
        <button
          type="button"
          className={filter === 'PENDING' ? 'active' : ''}
          onClick={() => setFilter('PENDING')}
        >
          Pending
        </button>
        <button
          type="button"
          className={filter === 'APPROVED' ? 'active' : ''}
          onClick={() => setFilter('APPROVED')}
        >
          Approved
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Shop</th>
            <th>Email</th>
            <th>Location</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((v) => (
            <tr key={v.id}>
              <td>{v.shopName}</td>
              <td>{v.email}</td>
              <td>
                {v.area.name}, {v.area.district.name}
              </td>
              <td>
                <span className={`status-badge status-${v.status.toLowerCase()}`}>{v.status}</span>
              </td>
              <td className="actions">
                {v.status === 'PENDING' && (
                  <>
                    <button type="button" onClick={() => approve(v.id)}>
                      Approve
                    </button>
                    <button type="button" className="danger" onClick={() => reject(v.id)}>
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
