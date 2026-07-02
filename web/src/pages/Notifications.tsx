import { useEffect, useState } from 'react';
import { fetchNotifications } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<Awaited<ReturnType<typeof fetchNotifications>>>([]);
  useEffect(() => { if (isAuthenticated) fetchNotifications().then(setItems).catch(() => {}); }, [isAuthenticated]);
  if (!isAuthenticated) return null;
  return (
    <div className="page-container">
      <h1 className="mb-4 text-2xl font-bold">Notifications</h1>
      {items.length === 0 ? <p>No notifications yet.</p> : (
        <ul className="space-y-3">{items.map((n) => (
          <li key={n.id} className={`card p-4 ${!n.isRead ? 'border-primary-300' : ''}`}>
            <p className="font-semibold">{n.title}</p>
            <p className="text-sm text-gray-600">{n.body}</p>
          </li>
        ))}</ul>
      )}
    </div>
  );
}
