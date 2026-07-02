import { useEffect, useState } from 'react';
import { api, type ApiResponse } from '../api/client';

interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  children?: Category[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const load = () => {
    api.get<ApiResponse<Category[]>>('/admin/categories').then((res) => setCategories(res.data.data));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/admin/categories', { name, slug, isActive: true });
    setName('');
    setSlug('');
    load();
  };

  return (
    <div>
      <h1>Categories</h1>
      <p className="page-desc">Top-level product categories (vendors assign from this list)</p>

      <form className="inline-form" onSubmit={handleCreate}>
        <input placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        <button type="submit">Add Category</button>
      </form>

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Slug</th>
            <th>Subcategories</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.slug}</td>
              <td>{c.children?.length ?? 0}</td>
              <td>{c.isActive ? 'Active' : 'Inactive'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
