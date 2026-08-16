import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { orderAPI } from '@/lib/api';
import type { Order } from '@/lib/types';
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants';
import type { OrderStatus } from '@/lib/constants';
import { SectionTitle } from '@/components/common/Breadcrumb';
import { EmptyState } from '@/components/ui/Spinner';
import Spinner from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Form';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getOrders().then((res) => {
      if ('orders' in res) setOrders(res.orders);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner className="py-20" size="lg" />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionTitle title="Order History" subtitle="Track and review your past orders" icon={Package} />

      {orders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl">
          <EmptyState
            icon={<Package className="w-8 h-8" />}
            title="No orders yet"
            message="When you place an order, it will appear here."
            action={<Link to="/products"><Button>Start Shopping</Button></Link>}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-xs text-slate-500">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{formatDate(order.createdAt)}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${ORDER_STATUS_COLORS[order.orderStatus as OrderStatus]}`}>
                  {ORDER_STATUS_LABELS[order.orderStatus as OrderStatus]}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                {order.items.slice(0, 3).map((item, i) => (
                  <div key={i} className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500 border border-slate-100">
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-500">
                    +{order.items.length - 3}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-500">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                  <p className="text-lg font-bold text-slate-900">{formatPrice(order.totalAmount)}</p>
                </div>
                <span className="text-sm font-medium text-slate-600 flex items-center gap-1">
                  View Details <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
