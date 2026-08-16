import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, MapPin, CreditCard, Truck, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { addressAPI, orderAPI } from '@/lib/api';
import type { Address } from '@/lib/types';
import { formatPrice } from '@/lib/constants';
import { Button } from '@/components/ui/Form';
import { SectionTitle } from '@/components/common/Breadcrumb';
import { EmptyState } from '@/components/ui/Spinner';
import Spinner from '@/components/ui/Spinner';

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    addressAPI.getAddresses().then((res) => {
      if ('addresses' in res) {
        setAddresses(res.addresses);
        const def = res.addresses.find((a) => a.isDefault);
        setSelectedAddress(def?._id || res.addresses[0]?._id || '');
      }
      setLoading(false);
    });
  }, []);

  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      showToast('Please select a shipping address', 'error');
      return;
    }
    setPlacing(true);
    const res = await orderAPI.createOrder({ shippingAddressId: selectedAddress, paymentMethod });
    setPlacing(false);
    if ('error' in res) {
      showToast(res.error, 'error');
    } else {
      await clearCart();
      showToast('Order placed successfully!');
      navigate(`/orders/${res.order._id}`);
    }
  };

  if (loading) return <Spinner className="py-20" size="lg" />;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SectionTitle title="Checkout" icon={CreditCard} />
        <div className="bg-white border border-slate-200 rounded-2xl">
          <EmptyState
            icon={<CreditCard className="w-8 h-8" />}
            title="Your cart is empty"
            message="Add items to your cart before checking out."
            action={<Link to="/products"><Button>Browse Products</Button></Link>}
          />
        </div>
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SectionTitle title="Checkout" icon={CreditCard} />
        <div className="bg-white border border-slate-200 rounded-2xl">
          <EmptyState
            icon={<MapPin className="w-8 h-8" />}
            title="No shipping address"
            message="Add a shipping address before placing an order."
            action={<Link to="/addresses"><Button>Add Address</Button></Link>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionTitle title="Checkout" subtitle="Review your order and place it" icon={CreditCard} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping address */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Shipping Address
            </h3>
            <div className="space-y-3">
              {addresses.map((addr) => (
                <label
                  key={addr._id}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedAddress === addr._id ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress === addr._id}
                      onChange={() => setSelectedAddress(addr._id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{addr.fullName} {addr.isDefault && <span className="text-xs text-slate-500">(Default)</span>}</p>
                      <p className="text-sm text-slate-600">{addr.addressLine}</p>
                      <p className="text-sm text-slate-600">{addr.city}, {addr.state} {addr.postalCode}</p>
                      <p className="text-sm text-slate-600">{addr.country} - {addr.phone}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <Link to="/addresses" className="text-sm text-blue-600 hover:underline mt-3 inline-block">Manage addresses</Link>
          </div>

          {/* Payment method */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> Payment Method
            </h3>
            <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              paymentMethod === 'cod' ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300'
            }`}>
              <div className="flex items-center gap-3">
                <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                <Truck className="w-5 h-5 text-slate-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Cash on Delivery</p>
                  <p className="text-xs text-slate-500">Pay when you receive your order</p>
                </div>
              </div>
            </label>
            <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors mt-3 ${
              paymentMethod === 'simulated' ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300'
            }`}>
              <div className="flex items-center gap-3">
                <input type="radio" name="payment" checked={paymentMethod === 'simulated'} onChange={() => setPaymentMethod('simulated')} />
                <CreditCard className="w-5 h-5 text-slate-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Simulated Payment</p>
                  <p className="text-xs text-slate-500">No real charge - for demo purposes</p>
                </div>
              </div>
            </label>
          </div>

          {/* Order items */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="font-bold text-slate-900 mb-4">Order Items ({items.length})</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.product._id} className="flex items-center gap-3">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-14 h-14 rounded-lg object-cover bg-slate-50" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-xl p-5 sticky top-24">
            <h3 className="font-bold text-slate-900 mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span className="font-medium">{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Shipping</span><span className="font-medium">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Tax</span><span className="font-medium">{formatPrice(tax)}</span></div>
              <div className="border-t border-slate-200 pt-3 flex justify-between">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-bold text-slate-900 text-lg">{formatPrice(total)}</span>
              </div>
            </div>
            <Button fullWidth size="lg" className="mt-4" loading={placing} onClick={handlePlaceOrder}>
              {!placing && <CheckCircle className="w-5 h-5" />} Place Order
            </Button>
            <p className="text-xs text-slate-400 text-center mt-3">By placing this order, you agree to our terms</p>
          </div>
        </div>
      </div>
    </div>
  );
}
