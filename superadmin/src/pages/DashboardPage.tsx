import { useEffect, useState } from 'react';
import { api, type ApiResponse } from '../api/client';
import type { HealthStatus } from '@shared/types';

export default function DashboardPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3000'}/api/v1/health`)
      .then((r) => r.json())
      .then((body: ApiResponse<HealthStatus>) => setHealth(body.data))
      .catch(() => setHealth(null));
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <p className="page-desc">Platform overview and system health</p>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">API Status</span>
          <span className={`stat-value status-${health?.status ?? 'down'}`}>
            {health?.status ?? 'offline'}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Database</span>
          <span className="stat-value">{health?.services.database ?? '—'}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Redis</span>
          <span className="stat-value">{health?.services.redis ?? '—'}</span>
        </div>
      </div>
    </div>
  );
}
