import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { orderAPI } from '@/lib/api';
import type { Order } from '@/lib/types';
import { formatPrice, formatDate, ORDER_STATUS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from '@/lib/constants';
import type { OrderStatus, PaymentStatus } from '@/lib/constants';
import { useToast } from '@/contexts/ToastContext';
import { Select } from '@/components/ui/Form';
import { SectionTitle } from '@/components/common/Breadcrumb';
import { EmptyState } from '@/components/ui/Spinner';
import Spinner from '@/components/ui/Spinner';

export default function ManageOrders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    const res = await orderAPI.getAllOrders();
    if ('orders' in res) setOrders(res.orders);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id: string, status: string) => {
    const res = await orderAPI.updateOrderStatus(id, status);
    if ('error' in res) { showToast(res.error, 'error'); return; }
    showToast(`Order status updated to ${ORDER_STATUS_LABELS[status as OrderStatus]}`);
    load();
  };

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.orderStatus === filter);

  if (loading) return <Spinner className="py-20" size="lg" />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionTitle
        title="Manage Orders"
        subtitle={`${orders.length} total orders`}
        icon={ShoppingBag}
        action={
          <div className="w-40">
            <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              {ORDER_STATUS.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
            </Select>
          </div>
        }
      />

      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl">
          <EmptyState icon={<ShoppingBag className="w-8 h-8" />} title="No orders found" message={filter !== 'all' ? 'No orders with this status.' : 'Orders will appear here once customers start buying.'} />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <div key={order._id} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Link to={`/orders/${order._id}`} className="text-sm font-bold text-slate-900 hover:underline">
                      #{order._id.slice(-8).toUpperCase()}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">{formatDate(order.createdAt)}</p>
                    <p className="text-xs text-slate-600 mt-1">{order.items.length} item{order.items.length !== 1 ? 's' : ''} - {order.shippingAddress.fullName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{formatPrice(order.totalAmount)}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${PAYMENT_STATUS_COLORS[order.paymentStatus as PaymentStatus]}`}>
                      {PAYMENT_STATUS_LABELS[order.paymentStatus as PaymentStatus]}
                    </span>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${ORDER_STATUS_COLORS[order.orderStatus as OrderStatus]}`}>
                    {ORDER_STATUS_LABELS[order.orderStatus as OrderStatus]}
                  </span>
                  <div className="w-36">
                    <Select value={order.orderStatus} onChange={(e) => handleStatusChange(order._id, e.target.value)}>
                      {ORDER_STATUS.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
                    </Select>
                  </div>
                  <Link to={`/orders/${order._id}`} className="p-2 text-slate-400 hover:text-slate-700">
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
