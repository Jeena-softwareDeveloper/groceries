import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDistrictId, getTrendingSearches, searchProducts } from '../api/client';

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Awaited<ReturnType<typeof searchProducts>> | null>(null);
  const [trending, setTrending] = useState<Array<{ query: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { getTrendingSearches().then(setTrending).catch(() => {}); }, []);

  useEffect(() => {
    if (!q.trim()) { setResults(null); return; }
    const t = setTimeout(() => {
      setLoading(true);
      searchProducts(q.trim())
        .then(setResults)
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="page-container">
      <h1 className="mb-4 text-2xl font-bold">Search</h1>
      <input className="mb-6 w-full rounded-lg border px-4 py-3" placeholder="Search products, shops..." value={q} onChange={(e) => setQ(e.target.value)} />
      {!q && trending.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 font-semibold">Trending</p>
          <div className="flex flex-wrap gap-2">
            {trending.map((t) => (
              <button key={t.query} type="button" className="rounded-full bg-gray-100 px-3 py-1 text-sm" onClick={() => setQ(t.query)}>{t.query}</button>
            ))}
          </div>
        </div>
      )}
      {loading && <p>Searching…</p>}
      {results && (
        <div className="space-y-6">
          {results.products.length > 0 && (
            <section>
              <h2 className="mb-2 font-semibold">Products</h2>
              <ul className="space-y-2">{results.products.map((p) => (
                <li key={p.id}><Link to={`/products/${p.id}`} className="text-primary-600 hover:underline">{p.name}</Link></li>
              ))}</ul>
            </section>
          )}
          {results.shops.length > 0 && (
            <section>
              <h2 className="mb-2 font-semibold">Shops</h2>
              <ul className="space-y-2">{results.shops.map((s) => (
                <li key={s.id}><Link to={`/shops/${s.id}`} className="text-primary-600 hover:underline">{s.shopName}</Link></li>
              ))}</ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
