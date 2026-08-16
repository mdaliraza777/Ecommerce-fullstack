import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Heart, ShoppingCart, User, LogOut, Menu, X, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { productIds } = useWishlist();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMobileOpen(false);
    }
  };

  const navLinkClass = "text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors";

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 hidden sm:block">ShopSphere</span>
          </Link>

          {/* Search - desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-400 focus:outline-none transition-colors"
              />
            </div>
          </form>

          {/* Right nav - desktop */}
          <nav className="hidden md:flex items-center gap-5">
            <Link to="/products" className={navLinkClass}>Shop</Link>

            {user ? (
              <>
                <Link to="/wishlist" className="relative flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors">
                  <Heart className="w-5 h-5" />
                  {productIds.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {productIds.length}
                    </span>
                  )}
                </Link>
                <Link to="/cart" className="relative flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                  {count > 0 && (
                    <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {count}
                    </span>
                  )}
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors">
                    <Shield className="w-5 h-5" />
                  </Link>
                )}
                <Link to="/profile" className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors">
                  <User className="w-5 h-5" />
                </Link>
                <button onClick={() => { logout(); navigate('/'); }} className="text-slate-600 hover:text-slate-900 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={navLinkClass}>Login</Link>
                <Link to="/register" className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-700 transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-slate-600">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50"
              />
            </form>
            <Link to="/products" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-slate-700">Shop</Link>
            {user ? (
              <>
                <Link to="/cart" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-slate-700">Cart ({count})</Link>
                <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-slate-700">Wishlist ({productIds.length})</Link>
                <Link to="/orders" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-slate-700">Orders</Link>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-slate-700">Profile</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-slate-700">Admin Dashboard</Link>
                )}
                <button onClick={() => { logout(); navigate('/'); setMobileOpen(false); }} className="block py-2 text-sm font-medium text-red-600">Logout</button>
              </>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 text-sm font-semibold border border-slate-300 rounded-lg">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
