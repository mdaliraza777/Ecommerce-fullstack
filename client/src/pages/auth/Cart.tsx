import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/constants';
import { Button } from '@/components/ui/Form';
import { SectionTitle } from '@/components/common/Breadcrumb';
import { EmptyState } from '@/components/ui/Spinner';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/contexts/AuthContext';

export default function Cart() {
  const { items, loading, updateQuantity, removeFromCart, subtotal, count } = useCart();
  const { user } = useAuth();

  if (loading) return <Spinner className="py-20" size="lg" />;

  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SectionTitle title="Shopping Cart" subtitle={`${count} item${count !== 1 ? 's' : ''}`} icon={ShoppingBag} />
        <div className="bg-white border border-slate-200 rounded-2xl">
          <EmptyState
            icon={<ShoppingBag className="w-8 h-8" />}
            title="Your cart is empty"
            message="Browse our products and add items to your cart to get started."
            action={<Link to="/products"><Button>Start Shopping</Button></Link>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionTitle title="Shopping Cart" subtitle={`${count} item${count !== 1 ? 's' : ''}`} icon={ShoppingBag} />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.product._id} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4">
              <Link to={`/products/${item.product._id}`} className="shrink-0">
                <img src={item.product.images[0]} alt={item.product.name} className="w-24 h-24 rounded-lg object-cover bg-slate-50" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product._id}`} className="text-sm font-semibold text-slate-800 hover:text-slate-900 line-clamp-2">
                  {item.product.name}
                </Link>
                <p className="text-sm font-bold text-slate-900 mt-1">{formatPrice(item.product.price)}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {item.product.stock === 0 ? 'Out of stock' : `${item.product.stock} available`}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div className="inline-flex items-center border border-slate-200 rounded-lg">
                    <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-l-lg">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product._id, Math.min(item.product.stock, item.quantity + 1))}
                      disabled={item.quantity >= item.product.stock}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-r-lg disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900">{formatPrice(item.product.price * item.quantity)}</span>
                    <button onClick={() => removeFromCart(item.product._id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-xl p-5 sticky top-24">
            <h3 className="font-bold text-slate-900 mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium text-slate-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-medium text-slate-900">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax (8%)</span>
                <span className="font-medium text-slate-900">{formatPrice(tax)}</span>
              </div>
              {subtotal < 50 && subtotal > 0 && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
                  Add {formatPrice(50 - subtotal)} more for free shipping!
                </p>
              )}
              <div className="border-t border-slate-200 pt-3 flex justify-between">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-bold text-slate-900 text-lg">{formatPrice(total)}</span>
              </div>
            </div>
            <Link to="/checkout">
              <Button fullWidth size="lg" className="mt-4">Proceed to Checkout <ArrowRight className="w-4 h-4" /></Button>
            </Link>
            <Link to="/products" className="block text-center text-sm text-slate-500 hover:text-slate-700 mt-3">
              Continue Shopping
            </Link>
            {!user && (
              <p className="text-xs text-center text-amber-600 mt-3 bg-amber-50 rounded-lg p-2">
                You need to be logged in to checkout
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
