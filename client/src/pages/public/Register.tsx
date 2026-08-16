import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Mail, Lock, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Form';

export default function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const res = await register(form);
    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      showToast('Account created! Welcome to ShopSphere.');
      navigate('/');
    }
  };

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text', icon: User, placeholder: 'John Doe' },
    { name: 'email', label: 'Email', type: 'email', icon: Mail, placeholder: 'you@example.com' },
    { name: 'password', label: 'Password', type: 'password', icon: Lock, placeholder: 'At least 6 characters' },
    { name: 'phone', label: 'Phone (optional)', type: 'tel', icon: Phone, placeholder: '555-0100' },
  ] as const;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="text-sm text-slate-500 mt-1">Join ShopSphere and start shopping</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{f.label}</label>
                <div className="relative">
                  <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={f.type}
                    required={f.name !== 'phone'}
                    value={form[f.name as keyof typeof form]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.name]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
                  />
                </div>
              </div>
            ))}
            <Button type="submit" fullWidth size="lg" loading={loading}>Create Account</Button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account? <Link to="/login" className="font-semibold text-slate-900 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
