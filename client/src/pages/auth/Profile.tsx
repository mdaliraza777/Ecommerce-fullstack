import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Shield, MapPin, Package, Heart, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button, Input } from '@/components/ui/Form';
import { SectionTitle } from '@/components/common/Breadcrumb';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateProfile(form);
    setLoading(false);
    if (res.error) {
      showToast(res.error, 'error');
    } else {
      showToast('Profile updated successfully');
      setEditing(false);
    }
  };

  const stats = [
    { icon: Package, label: 'Orders', to: '/orders', count: '' },
    { icon: MapPin, label: 'Addresses', to: '/addresses', count: '' },
    { icon: Heart, label: 'Wishlist', to: '/wishlist', count: '' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionTitle title="My Profile" subtitle="Manage your account information" icon={User} />

      {/* Profile card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-slate-700 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-sm text-slate-300">{user.email}</p>
              <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium bg-white/10 px-2 py-0.5 rounded-full">
                <Shield className="w-3 h-3" /> {user.role === 'admin' ? 'Administrator' : 'Customer'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Full Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
              <Input
                label="Phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="Add a phone number"
              />
              <div className="flex gap-2">
                <Button type="submit" loading={loading}><Save className="w-4 h-4" /> Save Changes</Button>
                <Button type="button" variant="ghost" onClick={() => { setEditing(false); setForm({ name: user.name, phone: user.phone }); }}>
                  <X className="w-4 h-4" /> Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm font-medium text-slate-800">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <Phone className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="text-sm font-medium text-slate-800">{user.phone || 'Not set'}</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" onClick={() => setEditing(true)}><Edit2 className="w-4 h-4" /> Edit Profile</Button>
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="flex flex-col items-center gap-2 p-5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all"
          >
            <s.icon className="w-6 h-6 text-slate-700" />
            <span className="text-sm font-medium text-slate-700">{s.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
