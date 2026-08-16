import { useEffect, useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, Check, X, Star } from 'lucide-react';
import { addressAPI } from '@/lib/api';
import type { Address } from '@/lib/types';
import { useToast } from '@/contexts/ToastContext';
import { Button, Input } from '@/components/ui/Form';
import { SectionTitle } from '@/components/common/Breadcrumb';
import { EmptyState } from '@/components/ui/Spinner';
import Spinner from '@/components/ui/Spinner';

export default function Addresses() {
  const { showToast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: '', phone: '', addressLine: '', city: '', state: '', postalCode: '', country: 'United States', isDefault: false,
  });

  const load = async () => {
    const res = await addressAPI.getAddresses();
    if ('addresses' in res) setAddresses(res.addresses);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ fullName: '', phone: '', addressLine: '', city: '', state: '', postalCode: '', country: 'United States', isDefault: false });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (editingId) {
      const res = await addressAPI.updateAddress(editingId, form);
      if ('error' in res) showToast(res.error, 'error');
      else showToast('Address updated');
    } else {
      const res = await addressAPI.addAddress(form);
      if ('error' in res) showToast(res.error, 'error');
      else showToast('Address added');
    }
    setSubmitting(false);
    resetForm();
    load();
  };

  const handleEdit = (addr: Address) => {
    setForm({
      fullName: addr.fullName, phone: addr.phone, addressLine: addr.addressLine,
      city: addr.city, state: addr.state, postalCode: addr.postalCode, country: addr.country, isDefault: addr.isDefault,
    });
    setEditingId(addr._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    const res = await addressAPI.deleteAddress(id);
    if ('error' in res) showToast(res.error, 'error');
    else { showToast('Address deleted'); load(); }
  };

  const handleSetDefault = async (id: string) => {
    const res = await addressAPI.updateAddress(id, { isDefault: true });
    if ('error' in res) showToast(res.error, 'error');
    else { showToast('Default address updated'); load(); }
  };

  if (loading) return <Spinner className="py-20" size="lg" />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionTitle
        title="My Addresses"
        subtitle="Manage your shipping addresses"
        icon={MapPin}
        action={!showForm && <Button size="sm" onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Add Address</Button>}
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">{editingId ? 'Edit Address' : 'New Address'}</h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Full Name" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} required />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required />
          </div>
          <Input label="Address Line" value={form.addressLine} onChange={(e) => setForm((f) => ({ ...f, addressLine: e.target.value }))} required placeholder="Street address, apartment, etc." />
          <div className="grid sm:grid-cols-3 gap-4">
            <Input label="City" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} required />
            <Input label="State" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} required />
            <Input label="Postal Code" value={form.postalCode} onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))} required />
          </div>
          <Input label="Country" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} required />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} className="rounded" />
            Set as default shipping address
          </label>
          <div className="flex gap-2">
            <Button type="submit" loading={submitting}>{editingId ? 'Update' : 'Add'} Address</Button>
            <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="bg-white border border-slate-200 rounded-2xl">
          <EmptyState
            icon={<MapPin className="w-8 h-8" />}
            title="No addresses yet"
            message="Add a shipping address to speed up your checkout process."
            action={<Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Add Address</Button>}
          />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr._id} className={`bg-white border rounded-xl p-5 ${addr.isDefault ? 'border-slate-900' : 'border-slate-200'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {addr.isDefault && <span className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-900 text-white px-2 py-0.5 rounded-full"><Star className="w-3 h-3 fill-white" /> Default</span>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(addr)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(addr._id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-900">{addr.fullName}</p>
              <p className="text-sm text-slate-600 mt-1">{addr.addressLine}</p>
              <p className="text-sm text-slate-600">{addr.city}, {addr.state} {addr.postalCode}</p>
              <p className="text-sm text-slate-600">{addr.country}</p>
              <p className="text-sm text-slate-500 mt-2">{addr.phone}</p>
              {!addr.isDefault && (
                <button onClick={() => handleSetDefault(addr._id)} className="mt-3 text-xs font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Set as default
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
