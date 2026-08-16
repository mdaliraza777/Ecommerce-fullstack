import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { wishlistAPI } from '@/lib/api';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/constants';
import StarRating from '@/components/common/StarRating';
import { Button } from '@/components/ui/Form';
import { SectionTitle } from '@/components/common/Breadcrumb';
import { EmptyState } from '@/components/ui/Spinner';
import Spinner from '@/components/ui/Spinner';

export default function Wishlist() {
  const { toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await wishlistAPI.getWishlist();
    if ('products' in res) setProducts(res.products as Product[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRemove = async (id: string) => {
    await toggleWishlist(id);
    showToast('Removed from wishlist', 'info');
    load();
  };

  const handleAddToCart = async (id: string, name: string) => {
    const res = await addToCart(id, 1);
    if ('error' in res) showToast('Please log in', 'error');
    else showToast(`${name} added to cart`);
  };

  if (loading) return <Spinner className="py-20" size="lg" />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionTitle title="My Wishlist" subtitle={`${products.length} saved item${products.length !== 1 ? 's' : ''}`} icon={Heart} />

      {products.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl">
          <EmptyState
            icon={<Heart className="w-8 h-8" />}
            title="Your wishlist is empty"
            message="Save items you love by clicking the heart icon on any product."
            action={<Link to="/products"><Button>Browse Products</Button></Link>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <div key={p._id} className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
              <Link to={`/products/${p._id}`} className="aspect-square bg-slate-50 overflow-hidden block">
                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </Link>
              <div className="p-3 flex flex-col flex-1">
                <Link to={`/products/${p._id}`} className="text-sm font-semibold text-slate-800 line-clamp-2 hover:text-slate-900">{p.name}</Link>
                <div className="mt-1"><StarRating rating={p.rating} /></div>
                <span className="text-lg font-bold text-slate-900 mt-1">{formatPrice(p.price)}</span>
                <div className="mt-auto flex gap-2 pt-3">
                  <Button size="sm" className="flex-1" onClick={() => handleAddToCart(p._id, p.name)} disabled={p.stock === 0}>
                    <ShoppingCart className="w-3.5 h-3.5" /> Cart
                  </Button>
                  <button onClick={() => handleRemove(p._id)} className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
