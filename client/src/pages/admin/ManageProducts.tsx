import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Package, Search } from 'lucide-react';
import { productAPI } from '@/lib/api';
import type { Product, Category } from '@/lib/types';
import { formatPrice } from '@/lib/constants';
import { useToast } from '@/contexts/ToastContext';
import { Button, Input, Textarea, Select } from '@/components/ui/Form';
import { SectionTitle } from '@/components/common/Breadcrumb';
import { EmptyState } from '@/components/ui/Spinner';
import Spinner from '@/components/ui/Spinner';

export default function ManageProducts() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', price: 0, images: '', category: '', stock: 0,
  });

  const load = async () => {
    const [prodRes, catRes] = await Promise.all([productAPI.getProducts({ page: 1, limit: 1000 }), productAPI.getCategories()]);
    if ('products' in prodRes) setProducts(prodRes.products);
    if ('categories' in catRes) setCategories(catRes.categories);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ name: '', description: '', price: 0, images: '', category: '', stock: 0 });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (p: Product) => {
    setForm({
      name: p.name, description: p.description, price: p.price,
      images: p.images.join(', '), category: p.category, stock: p.stock,
    });
    setEditingId(p._id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const data = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
      category: form.category,
      stock: Number(form.stock),
    };
    if (editingId) {
      const res = await productAPI.updateProduct(editingId, data);
      if ('error' in res) { showToast(res.error, 'error'); setSubmitting(false); return; }
      showToast('Product updated');
    } else {
      const res = await productAPI.createProduct(data);
      if ('error' in res) { showToast(String(res.error), 'error'); setSubmitting(false); return; }
      showToast('Product created');
    }
    setSubmitting(false);
    resetForm();
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this product? It will be hidden from the store.')) return;
    const res = await productAPI.deleteProduct(id);
    if ('error' in res) showToast(res.error, 'error');
    else { showToast('Product removed'); load(); }
  };

  const categoryName = (catId: string) => categories.find((c) => c._id === catId)?.name || 'Uncategorized';

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner className="py-20" size="lg" />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionTitle
        title="Manage Products"
        subtitle={`${products.length} products in catalog`}
        icon={Package}
        action={!showForm && <Button size="sm" onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Add Product</Button>}
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">{editingId ? 'Edit Product' : 'New Product'}</h3>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <Input label="Product Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <Textarea label="Description" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required />
          <div className="grid sm:grid-cols-3 gap-4">
            <Input label="Price ($)" type="number" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} required />
            <Input label="Stock" type="number" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))} required />
            <Select label="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} required>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </Select>
          </div>
          <Input label="Image URLs (comma-separated)" value={form.images} onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))} placeholder="https://..." required />
          <div className="flex gap-2">
            <Button type="submit" loading={submitting}>{editingId ? 'Update' : 'Create'} Product</Button>
            <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:border-slate-400 focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl">
          <EmptyState icon={<Package className="w-8 h-8" />} title="No products found" message={search ? 'Try a different search term.' : 'Add your first product to get started.'} action={!search && <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Add Product</Button>} />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Product</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700 hidden sm:table-cell">Category</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-700">Price</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-700 hidden sm:table-cell">Stock</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0" />
                        <span className="font-medium text-slate-800 line-clamp-1">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{categoryName(p.category)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      <span className={p.stock < 15 ? 'text-amber-600 font-semibold' : 'text-slate-600'}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(p)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(p._id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
