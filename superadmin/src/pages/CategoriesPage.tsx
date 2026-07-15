import { useState } from 'react';
import { Eye, Edit, Trash2, Tag, Plus, X } from 'lucide-react';
import { categoryApi } from '../api';
import { useApiData } from '../hooks';
import { PageHeader, SearchBar, DataTable, Pagination, StatusBadge, EmptyState, ColumnDef } from '../components/ui';
import type { Category } from '../types';

export default function CategoriesPage() {
  const { data: categories = [], loading, refetch } = useApiData(() => categoryApi.getAll());
  
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [search, setSearch] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await categoryApi.create({ name, slug, isActive: true });
    setName('');
    setSlug('');
    setShowForm(false);
    refetch();
  };

  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const columns: ColumnDef<Category>[] = [
    {
      key: 'id',
      header: '#',
      headerClassName: 'pl-6',
      cellClassName: 'pl-6 font-semibold text-slate-400',
      cell: (_, index) => String(index + 1).padStart(2, '0')
    },
    {
      key: 'name',
      header: 'Name',
      cell: (c) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
            <Tag size={14} className="text-slate-400" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-slate-900">{c.name}</span>
        </div>
      )
    },
    {
      key: 'slug',
      header: 'Slug',
      cell: (c) => (
        <span className="bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-bold lowercase font-mono tracking-tight">
          {c.slug}
        </span>
      )
    },
    {
      key: 'subcategories',
      header: 'Subcategories',
      cell: (c) => (
        <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-xs font-bold">
          {c.children?.length ?? 0}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      cell: (c) => (
        <StatusBadge 
          status={c.isActive ? 'Active' : 'Inactive'} 
          colorMap={{
            Active: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
            Inactive: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
          }} 
        />
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'pr-6',
      cellClassName: 'pr-6',
      cell: () => (
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <Eye size={14} strokeWidth={2.5} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <Edit size={14} strokeWidth={2.5} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-red-400 cursor-pointer hover:bg-red-50 hover:border-red-200 transition-colors">
            <Trash2 size={14} strokeWidth={2.5} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto pb-12 text-slate-900">
      <PageHeader 
        title="Categories" 
        description="Manage product categories and their hierarchy." 
        action={
          <button
            className="flex items-center gap-2 bg-slate-900 border border-transparent text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? <X size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
            {showForm ? 'Cancel' : 'Add Category'}
          </button>
        }
      />

      {showForm && (
        <form
          className="flex flex-wrap items-end gap-4 p-5 bg-white rounded-2xl border border-slate-200/75 shadow-sm"
          onSubmit={handleCreate}
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Category Name</label>
            <input
              className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none bg-white placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all w-56"
              placeholder="e.g. Fruits & Vegetables"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Slug</label>
            <input
              className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none bg-white placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all w-44"
              placeholder="e.g. fruits-vegetables"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Save Category
          </button>
        </form>
      )}

      <SearchBar 
        value={search} 
        onChange={setSearch} 
        placeholder="Search categories..." 
        totalCount={categories.length} 
        totalLabel="total categories"
      />

      <DataTable 
        columns={columns}
        data={filteredCategories}
        loading={loading}
        emptyState={
          <EmptyState 
            icon={Tag} 
            title="No categories yet" 
            description={search ? "No categories match your search." : "Click \"Add Category\" to create your first one."}
            action={!search && (
              <button
                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                onClick={() => setShowForm(true)}
              >
                <Plus size={14} strokeWidth={2.5} /> Add Category
              </button>
            )}
          />
        }
        pagination={
          filteredCategories.length > 0 && (
            <Pagination 
              total={filteredCategories.length}
              page={1}
              limit={10}
              entityName="categories"
            />
          )
        }
      />
    </div>
  );
}
