import { useEffect, useState } from 'react';
import { createSupportTicket, listSupportTickets } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function SupportPage() {
  const { isAuthenticated } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [tickets, setTickets] = useState<Awaited<ReturnType<typeof listSupportTickets>>>([]);
  const [sent, setSent] = useState(false);

  const load = () => listSupportTickets().then(setTickets).catch(() => {});
  useEffect(() => { if (isAuthenticated) load(); }, [isAuthenticated]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSupportTicket(subject, message);
    setSubject(''); setMessage(''); setSent(true); load();
  };

  if (!isAuthenticated) return null;
  return (
    <div className="page-container max-w-lg">
      <h1 className="mb-4 text-2xl font-bold">Help & Support</h1>
      <form className="card mb-6 space-y-3 p-4" onSubmit={submit}>
        <input className="w-full rounded border px-3 py-2" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        <textarea className="w-full rounded border px-3 py-2" placeholder="Message" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} required />
        <button type="submit" className="btn-primary">Submit ticket</button>
        {sent && <p className="text-sm text-green-600">Ticket submitted!</p>}
      </form>
      {tickets.length > 0 && (
        <ul className="space-y-2">{tickets.map((t) => (
          <li key={t.id} className="card p-3 text-sm"><strong>{t.subject}</strong> — {t.status}</li>
        ))}</ul>
      )}
    </div>
  );
}
