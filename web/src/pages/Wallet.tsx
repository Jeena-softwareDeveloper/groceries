import { useEffect, useState } from 'react';
import { fetchWallet } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function WalletPage() {
  const { isAuthenticated } = useAuth();
  const [wallet, setWallet] = useState<{ balance: number; transactions: Array<{ id: string; amount: number; type: string }> } | null>(null);
  useEffect(() => { if (isAuthenticated) fetchWallet().then(setWallet).catch(() => {}); }, [isAuthenticated]);
  if (!isAuthenticated) return null;
  return (
    <div className="page-container">
      <h1 className="mb-4 text-2xl font-bold">Wallet</h1>
      <div className="card mb-6 bg-primary-600 p-6 text-white">
        <p className="text-sm opacity-90">Balance</p>
        <p className="text-3xl font-bold">₹{Number(wallet?.balance ?? 0).toFixed(0)}</p>
      </div>
      <h2 className="mb-2 font-semibold">Transactions</h2>
      {(wallet?.transactions ?? []).length === 0 ? <p className="text-gray-500">No transactions yet.</p> : (
        <ul className="space-y-2">{wallet!.transactions.map((t) => (
          <li key={t.id} className="card flex justify-between p-3 text-sm">
            <span>{t.type}</span>
            <span className={t.amount < 0 ? 'text-red-600' : 'text-green-600'}>₹{Math.abs(t.amount)}</span>
          </li>
        ))}</ul>
      )}
    </div>
  );
}
