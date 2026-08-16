import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, DollarSign, Users, Package, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants';
import type { OrderStatus } from '@/lib/constants';
import type { Order, Product } from '@/lib/types';
import { SectionTitle } from '@/components/common/Breadcrumb';
import Spinner from '@/components/ui/Spinner';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: Order[];
  lowStockProducts: Product[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats().then((res) => {
      if ('stats' in res) setStats(res.stats);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner className="py-20" size="lg" />;

  const cards = [
    { label: 'Total Revenue', value: formatPrice(stats?.totalRevenue || 0), icon: DollarSign, color: 'bg-emerald-500' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingBag, color: 'bg-blue-500' },
    { label: 'Products', value: stats?.totalProducts || 0, icon: Package, color: 'bg-slate-700' },
    { label: 'Customers', value: stats?.totalUsers || 0, icon: Users, color: 'bg-amber-500' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionTitle title="Admin Dashboard" subtitle="Overview of your store performance" icon={TrendingUp} />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-slate-200 rounded-xl p-5">
            <div className={`w-10 h-10 rounded-lg ${c.color} flex items-center justify-center mb-3`}>
              <c.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{c.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Recent Orders</h3>
            <Link to="/admin/orders" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {stats?.recentOrders.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {stats?.recentOrders.map((order) => (
                <Link key={order._id} to={`/orders/${order._id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-900">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-slate-500">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{formatPrice(order.totalAmount)}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${ORDER_STATUS_COLORS[order.orderStatus as OrderStatus]}`}>
                      {ORDER_STATUS_LABELS[order.orderStatus as OrderStatus]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Low Stock Alert
            </h3>
            <Link to="/admin/products" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {stats?.lowStockProducts.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">All products well stocked</p>
          ) : (
            <div className="space-y-3">
              {stats?.lowStockProducts.map((p) => (
                <div key={p._id} className="flex items-center gap-3 p-3 rounded-lg bg-amber-50/50">
                  <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 line-clamp-1">{p.name}</p>
                  </div>
                  <span className="text-sm font-bold text-amber-600">{p.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Link to="/admin/products" className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors flex items-center gap-3">
          <Package className="w-8 h-8 text-slate-700" />
          <div><p className="font-semibold text-slate-900">Manage Products</p><p className="text-xs text-slate-500">Add, edit, or remove products</p></div>
        </Link>
        <Link to="/admin/orders" className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-slate-700" />
          <div><p className="font-semibold text-slate-900">Manage Orders</p><p className="text-xs text-slate-500">Update order statuses</p></div>
        </Link>
      </div>
    </div>
  );
}
