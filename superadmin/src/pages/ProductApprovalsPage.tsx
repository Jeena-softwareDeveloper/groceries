import React, { useState, useEffect } from 'react';
import { api } from '../api';
import './DashboardPage.css';

interface ProductApproval {
  id: string;
  productId: string;
  vendorId: string;
  status: string;
  rejectionReason: string | null;
  adminNotes: string | null;
  createdAt: string;
  product: {
    name: string;
    sellingPrice: number | string;
    inventory?: { stock: number } | null;
    category?: { name: string } | null;
    images?: { url: string }[];
    vendor?: { shopName: string } | null;
  };
}

export default function ProductApprovalsPage() {
  const [approvals, setApprovals] = useState<ProductApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('PENDING');

  const [modalApproval, setModalApproval] = useState<ProductApproval | null>(null);
  const [actionType, setActionType] = useState<'REJECT' | 'REQUEST_CHANGES' | null>(null);
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApprovals = async (status: string) => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/product-approvals', { params: { status, limit: 100 } });
      setApprovals(data.data ?? []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to fetch approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals(activeTab);
  }, [activeTab]);

  const handleApprove = async (id: string) => {
    if (!window.confirm('Approve this product? It will be visible to customers.')) return;
    try {
      await api.post(`/admin/product-approvals/${id}/approve`);
      fetchApprovals(activeTab);
    } catch (e: any) {
      alert(e.response?.data?.error?.message || 'Error approving product');
    }
  };

  const submitAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalApproval || !actionType) return;
    if (!notes.trim()) return alert('Notes/Reason is required');

    setActionLoading(true);
    try {
      if (actionType === 'REJECT') {
        await api.post(`/admin/product-approvals/${modalApproval.id}/reject`, { reason: notes });
      } else {
        await api.post(`/admin/product-approvals/${modalApproval.id}/request-changes`, { notes });
      }
      setModalApproval(null);
      setNotes('');
      fetchApprovals(activeTab);
    } catch (e: any) {
      alert(e.response?.data?.error?.message || 'Error processing request');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Product Approvals</h1>
        <p>Review products submitted by vendors</p>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'PENDING' ? 'active' : ''}`} onClick={() => setActiveTab('PENDING')}>Pending Review</button>
        <button className={`tab ${activeTab === 'APPROVED' ? 'active' : ''}`} onClick={() => setActiveTab('APPROVED')}>Approved</button>
        <button className={`tab ${activeTab === 'REJECTED' ? 'active' : ''}`} onClick={() => setActiveTab('REJECTED')}>Rejected</button>
        <button className={`tab ${activeTab === 'CHANGES_REQUESTED' ? 'active' : ''}`} onClick={() => setActiveTab('CHANGES_REQUESTED')}>Changes Requested</button>
      </div>

      {loading ? (
        <div className="loading">Loading approvals...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : approvals.length === 0 ? (
        <div className="empty-state">No products found in this category.</div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Vendor</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvals.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {item.product.images?.[0]?.url && (
                        <img src={item.product.images[0].url} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                      )}
                      <strong>{item.product.name}</strong>
                    </div>
                  </td>
                  <td>{item.product.vendor?.shopName || 'Unknown Vendor'}</td>
                  <td>{item.product.category?.name || 'Uncategorized'}</td>
                  <td>₹{item.product.sellingPrice}</td>
                  <td>{item.product.inventory?.stock ?? 0}</td>
                  <td>
                    <span className={`status-badge ${item.status.toLowerCase()}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="actions">
                    {item.status === 'PENDING' && (
                      <>
                        <button className="btn-icon btn-approve" title="Approve" onClick={() => handleApprove(item.id)}>✓ Approve</button>
                        <button className="btn-icon btn-reject" title="Reject" onClick={() => { setModalApproval(item); setActionType('REJECT'); }}>✗ Reject</button>
                        <button className="btn-icon btn-edit" title="Request Changes" onClick={() => { setModalApproval(item); setActionType('REQUEST_CHANGES'); }}>✏️ Request Changes</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Action Modal */}
      {modalApproval && actionType && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{actionType === 'REJECT' ? 'Reject Product' : 'Request Changes'}</h2>
            <p>Product: {modalApproval.product.name}</p>
            <form onSubmit={submitAction}>
              <div className="form-group">
                <label>
                  {actionType === 'REJECT' ? 'Rejection Reason *' : 'Changes Required *'}
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    required
                    rows={4}
                    placeholder="Enter notes to send to the vendor..."
                  />
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => { setModalApproval(null); setNotes(''); }}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Processing...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
