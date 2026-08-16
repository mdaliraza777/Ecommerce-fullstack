import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Minus, Plus, ArrowLeft, Truck, ShieldCheck, RotateCcw, Pencil, Trash2, X } from 'lucide-react';
import { productAPI, reviewAPI } from '@/lib/api';
import type { Product, Category, Review } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/constants';
import StarRating from '@/components/common/StarRating';
import Spinner from '@/components/ui/Spinner';
import { Button, Input, Textarea } from '@/components/ui/Form';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';

type SortOption = 'recent' | 'oldest' | 'highest' | 'lowest';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productAPI.getProduct(id).then((res) => {
      if ('product' in res) {
        setProduct(res.product);
        setCategory(res.category || null);
        setReviews(res.reviews || []);
      }
      setLoading(false);
    });
  }, [id]);

  const userReview = useMemo(
    () => reviews.find((r) => user && r.user === user._id),
    [reviews, user],
  );

  const ratingDistribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++;
    });
    return dist;
  }, [reviews]);

  const sortedReviews = useMemo(() => {
    const sorted = [...reviews];
    switch (sortBy) {
      case 'recent':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'highest':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return sorted.sort((a, b) => a.rating - b.rating);
      default:
        return sorted;
    }
  }, [reviews, sortBy]);

  const handleAddToCart = async () => {
    if (!product) return;
    const res = await addToCart(product._id, quantity);
    if ('error' in res) {
      showToast('Please log in to add items to cart', 'error');
    } else {
      showToast(`${quantity} x ${product.name} added to cart`);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    const res = await addToCart(product._id, quantity);
    if ('error' in res) {
      showToast('Please log in to continue', 'error');
    } else {
      navigate('/cart');
    }
  };

  const handleWishlist = async () => {
    if (!product) return;
    const added = await toggleWishlist(product._id);
    showToast(added ? 'Added to wishlist' : 'Removed from wishlist', added ? 'success' : 'info');
  };

  const refreshProduct = async () => {
    if (!product) return;
    const fresh = await productAPI.getProduct(product._id);
    if ('product' in fresh) {
      setProduct(fresh.product);
      setReviews(fresh.reviews || []);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSubmitting(true);
    if (editingReviewId) {
      const res = await reviewAPI.editReview(editingReviewId, {
        product: product._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      setSubmitting(false);
      if ('error' in res) {
        showToast(res.error, 'error');
      } else {
        showToast('Review updated!');
        setShowReviewForm(false);
        setEditingReviewId(null);
        setReviewForm({ rating: 5, comment: '' });
        await refreshProduct();
      }
    } else {
      const res = await reviewAPI.addReview({
        product: product._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      setSubmitting(false);
      if ('error' in res) {
        showToast(res.error, 'error');
      } else {
        showToast('Review submitted!');
        setShowReviewForm(false);
        setReviewForm({ rating: 5, comment: '' });
        await refreshProduct();
      }
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReviewId(review._id);
    setReviewForm({ rating: review.rating, comment: review.comment });
    setShowReviewForm(true);
    window.scrollTo({ top: document.getElementById('reviews-section')?.offsetTop || 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setShowReviewForm(false);
    setEditingReviewId(null);
    setReviewForm({ rating: 5, comment: '' });
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!product) return;
    const res = await reviewAPI.deleteReview(reviewId, product._id);
    if ('error' in res) {
      showToast(res.error, 'error');
    } else {
      showToast('Review deleted');
      setConfirmDeleteId(null);
      await refreshProduct();
    }
  };

  if (loading) return <Spinner className="py-20" size="lg" />;
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-600 mb-4">Product not found.</p>
        <Link to="/products"><Button>Back to Products</Button></Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[
        { label: 'Home', to: '/' },
        { label: 'Products', to: '/products' },
        { label: product.name },
      ]} />

      <Link to="/products" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to products
      </Link>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="relative aspect-square bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          <button
            onClick={handleWishlist}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md"
          >
            <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
          </button>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {category && (
            <Link to={`/products?category=${category._id}`} className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
              {category.name}
            </Link>
          )}
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.rating} size="md" showValue count={product.numReviews} />
          </div>

          <p className="text-3xl font-bold text-slate-900 mb-4">{formatPrice(product.price)}</p>

          <p className="text-sm text-slate-600 leading-relaxed mb-6">{product.description}</p>

          {/* Stock */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> In Stock
                {product.stock < 15 && <span className="text-amber-600 ml-1">({product.stock} left)</span>}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm font-medium text-red-600">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Out of Stock
              </span>
            )}
          </div>

          {/* Quantity selector */}
          {product.stock > 0 && (
            <div className="mb-6">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Quantity</label>
              <div className="inline-flex items-center border border-slate-200 rounded-lg">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-l-lg"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-r-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Button onClick={handleAddToCart} disabled={product.stock === 0} size="lg" className="flex-1">
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </Button>
            <Button onClick={handleBuyNow} disabled={product.stock === 0} size="lg" variant="secondary" className="flex-1">
              Buy Now
            </Button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200">
            {[
              { icon: Truck, label: 'Free Shipping' },
              { icon: ShieldCheck, label: 'Secure Payment' },
              { icon: RotateCcw, label: '30-Day Returns' },
            ].map((b, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-1.5">
                <b.icon className="w-5 h-5 text-slate-600" />
                <span className="text-xs text-slate-500">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <section id="reviews-section" className="mt-16 scroll-mt-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Customer Reviews</h2>

        {/* Rating summary + distribution */}
        <div className="grid md:grid-cols-[260px_1fr] gap-6 lg:gap-10 mb-8 pb-8 border-b border-slate-200">
          {/* Overall score */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold text-slate-900 leading-none">
                {product.rating > 0 ? product.rating.toFixed(1) : '0.0'}
              </span>
              <span className="text-lg text-slate-400 mb-1">/ 5</span>
            </div>
            <div className="mt-2">
              <StarRating rating={product.rating} size="md" />
            </div>
            <p className="text-sm text-slate-500 mt-2">
              Based on {product.numReviews} {product.numReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Distribution bars */}
          <div className="flex flex-col justify-center gap-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingDistribution[star - 1];
              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-500 w-8 text-right">{star} star</span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden max-w-md">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions: write review / sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            {user && !userReview && !showReviewForm && (
              <Button variant="outline" size="sm" onClick={() => setShowReviewForm(true)}>
                Write a Review
              </Button>
            )}
            {user && userReview && !showReviewForm && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>You've reviewed this product.</span>
                <button
                  onClick={() => handleEditReview(userReview)}
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
              </div>
            )}
            {!user && (
              <p className="text-sm text-slate-500">
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">Sign in</Link> to write a review
              </p>
            )}
          </div>

          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          )}
        </div>

        {/* Review form */}
        {showReviewForm && user && (
          <form onSubmit={handleReviewSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">
                {editingReviewId ? 'Edit Your Review' : 'Write a Review'}
              </h3>
              <button type="button" onClick={handleCancelEdit} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setReviewForm((f) => ({ ...f, rating: n }))}
                    className="text-2xl transition-transform hover:scale-110"
                  >
                    <span className={n <= reviewForm.rating ? 'text-amber-400' : 'text-slate-200'}>&#9733;</span>
                  </button>
                ))}
                <span className="ml-2 text-sm font-medium text-slate-600">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewForm.rating]}
                </span>
              </div>
            </div>
            <Textarea
              label="Your Review"
              rows={3}
              placeholder="Share your experience with this product..."
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
              required
            />
            <div className="flex gap-2">
              <Button type="submit" loading={submitting}>
                {editingReviewId ? 'Update Review' : 'Submit Review'}
              </Button>
              <Button type="button" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
            </div>
          </form>
        )}

        {/* Review list */}
        {reviews.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500">No reviews yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedReviews.map((r) => {
              const isOwner = user && r.user === user._id;
              return (
                <div key={r._id} className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-700">
                        {r.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-800">{r.userName}</p>
                          {isOwner && (
                            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">You</span>
                          )}
                        </div>
                        <StarRating rating={r.rating} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span>
                      {isOwner && !confirmDeleteId && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditReview(r)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            aria-label="Edit review"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(r._id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            aria-label="Delete review"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{r.comment}</p>

                  {/* Delete confirmation */}
                  {confirmDeleteId === r._id && (
                    <div className="mt-4 flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                      <span className="text-sm text-red-700">Delete this review? This cannot be undone.</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="danger" onClick={() => handleDeleteReview(r._id)}>
                          Delete
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteId(null)}>
                          Keep
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
