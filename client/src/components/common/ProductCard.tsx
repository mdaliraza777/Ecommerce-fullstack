import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/constants';
import StarRating from './StarRating';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/contexts/ToastContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock === 0) {
      showToast('This item is out of stock', 'error');
      return;
    }
    const res = await addToCart(product._id, 1);
    if ('error' in res) {
      showToast('Please log in to add items to cart', 'error');
    } else {
      showToast(`${product.name} added to cart`);
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    const added = await toggleWishlist(product._id);
    showToast(added ? 'Added to wishlist' : 'Removed from wishlist', added ? 'success' : 'info');
  };

  const inWishlist = isInWishlist(product._id);

  return (
    <Link
      to={`/products/${product._id}`}
      className="group relative bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-square bg-slate-50 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          aria-label="Toggle wishlist"
        >
          <Heart className={`w-4.5 h-4.5 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
        </button>
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
            <span className="bg-white text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-full">Out of Stock</span>
          </div>
        )}
        {product.stock > 0 && product.stock < 15 && (
          <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-semibold px-2 py-1 rounded-full">
            Only {product.stock} left
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 mb-1 group-hover:text-slate-900">
          {product.name}
        </h3>
        <div className="mb-2">
          <StarRating rating={product.rating} count={product.numReviews} />
        </div>
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-slate-900">{formatPrice(product.price)}</span>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
