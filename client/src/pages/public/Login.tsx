import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button, Input } from '@/components/ui/Form';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirect = (location.state as { from?: string })?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      showToast('Welcome back!');
      navigate(redirect);
    }
  };

  const fillDemo = (role: 'user' | 'admin') => {
    if (role === 'admin') {
      setEmail('admin@shopsphere.com');
      setPassword('password123');
    } else {
      setEmail('demo@shopsphere.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to your ShopSphere account</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
                />
              </div>
            </div>
            <Button type="submit" fullWidth size="lg" loading={loading}>Sign In</Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-center text-slate-500 mb-3">Try a demo account:</p>
            <div className="flex gap-2">
              <Button variant="outline" fullWidth size="sm" onClick={() => fillDemo('user')}>Customer Demo</Button>
              <Button variant="outline" fullWidth size="sm" onClick={() => fillDemo('admin')}>Admin Demo</Button>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account? <Link to="/register" className="font-semibold text-slate-900 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
