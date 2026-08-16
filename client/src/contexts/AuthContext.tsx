import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authAPI } from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<{ error?: string }>;
  logout: () => void;
  updateProfile: (data: { name?: string; phone?: string }) => Promise<{ error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = authAPI.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    const res = await authAPI.getProfile();
    if ('user' in res) {
      setUser(res.user);
    } else {
      authAPI.logout();
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    if ('error' in res) return { error: res.error };
    setUser(res.user);
    return {};
  }, []);

  const register = useCallback(async (data: { name: string; email: string; password: string; phone?: string }) => {
    const res = await authAPI.register(data);
    if ('error' in res) return { error: res.error };
    setUser(res.user);
    return {};
  }, []);

  const logout = useCallback(() => {
    authAPI.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: { name?: string; phone?: string }) => {
    const res = await authAPI.updateProfile(data);
    if ('error' in res) return { error: res.error };
    setUser(res.user);
    return {};
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
