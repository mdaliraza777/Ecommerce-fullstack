import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard, CheckCircle, Clock, XCircle, Truck } from 'lucide-react';
import { orderAPI } from '@/lib/api';
import type { Order } from '@/lib/types';
import {
  formatPrice, formatDate,
  ORDER_STATUS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS,
  PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS,
  getStatusStepIndex,
} from '@/lib/constants';
import type { OrderStatus, PaymentStatus } from '@/lib/constants';
import { Button } from '@/components/ui/Form';
import Breadcrumb from '@/components/common/Breadcrumb';
import Spinner from '@/components/ui/Spinner';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    orderAPI.getOrder(id).then((res) => {
      if ('order' in res) setOrder(res.order);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <Spinner className="py-20" size="lg" />;

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-600 mb-4">Order not found.</p>
        <Link to="/orders"><Button>Back to Orders</Button></Link>
      </div>
    );
  }

  const currentStep = getStatusStepIndex(order.orderStatus as OrderStatus);
  const isCancelled = order.orderStatus === 'cancelled';
  const shipping = order.totalAmount > 50 ? 0 : 5.99;
  const tax = order.totalAmount * 0.08 / 1.08;
  const subtotal = order.totalAmount - shipping - tax;

  const activeSteps = ORDER_STATUS.filter((s) => s !== 'cancelled');

  const stepIcons: Record<string, typeof Clock> = {
    placed: CheckCircle,
    confirmed: CheckCircle,
    processing: Clock,
    shipped: Truck,
    out_for_delivery: Truck,
    delivered: Package,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[
        { label: 'Home', to: '/' },
        { label: 'Orders', to: '/orders' },
        { label: `Order #${order._id.slice(-8).toUpperCase()}` },
      ]} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-slate-500 mt-0.5">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <span className={`text-sm font-semibold px-3 py-1.5 rounded-full border ${ORDER_STATUS_COLORS[order.orderStatus as OrderStatus]}`}>
          {ORDER_STATUS_LABELS[order.orderStatus as OrderStatus]}
        </span>
      </div>

      {/* Status tracking */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-slate-900 mb-5">Order Tracking</h3>
        {isCancelled ? (
          <div className="flex items-center gap-3 text-red-600 bg-red-50 rounded-lg p-4">
            <XCircle className="w-6 h-6" />
            <div>
              <p className="font-semibold">This order was cancelled</p>
              <p className="text-sm text-red-500">Payment status: {PAYMENT_STATUS_LABELS[order.paymentStatus as PaymentStatus]}</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Progress line */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-200" />
            <div
              className="absolute top-5 left-5 h-0.5 bg-emerald-500 transition-all duration-500"
              style={{ width: `calc(${(currentStep / (activeSteps.length - 1)) * 100}% - 1.25rem)` }}
            />
            <div className="relative flex justify-between">
              {activeSteps.map((step, i) => {
                const Icon = stepIcons[step] || Clock;
                const isCompleted = i <= currentStep;
                const isCurrent = i === currentStep;
                return (
                  <div key={step} className="flex flex-col items-center gap-2 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors z-10 ${
                      isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-300'
                    } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] sm:text-xs text-center font-medium ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                      {ORDER_STATUS_LABELS[step]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        {/* Shipping address */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" /> Shipping Address</h3>
          <div className="text-sm text-slate-600 space-y-1">
            <p className="font-medium text-slate-900">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.addressLine}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
            <p>{order.shippingAddress.country}</p>
            <p>{order.shippingAddress.phone}</p>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Status</span>
              <span className={`font-semibold px-2 py-0.5 rounded-full text-xs border ${PAYMENT_STATUS_COLORS[order.paymentStatus as PaymentStatus]}`}>
                {PAYMENT_STATUS_LABELS[order.paymentStatus as PaymentStatus]}
              </span>
            </div>
            <div className="flex justify-between"><span className="text-slate-600">Method</span><span className="font-medium">Cash on Delivery</span></div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
        <h3 className="font-bold text-slate-900 mb-4">Items ({order.items.length})</h3>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
              <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-400">
                {item.name.charAt(0)}
              </div>
              <Link to={`/products/${item.product}`} className="flex-1 text-sm font-medium text-slate-800 hover:text-slate-900 line-clamp-2">
                {item.name}
              </Link>
              <div className="text-right">
                <p className="text-xs text-slate-500">{item.quantity} x {formatPrice(item.price)}</p>
                <p className="text-sm font-semibold text-slate-900">{formatPrice(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="font-bold text-slate-900 mb-4">Payment Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-slate-600">Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
          <div className="flex justify-between"><span className="text-slate-600">Tax</span><span>{formatPrice(tax)}</span></div>
          <div className="flex justify-between pt-2 border-t border-slate-200"><span className="font-bold text-slate-900">Total</span><span className="font-bold text-slate-900 text-lg">{formatPrice(order.totalAmount)}</span></div>
        </div>
      </div>

      <div className="mt-6">
        <Link to="/orders"><Button variant="outline"><ArrowLeft className="w-4 h-4" /> Back to Orders</Button></Link>
      </div>
    </div>
  );
}
