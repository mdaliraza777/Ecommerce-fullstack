import express from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 9 } = req.query;
    const query = { isActive: true };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category && category !== 'all') query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = {};
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };
    else sortOption = { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const products = await Product.find(query).sort(sortOption).skip(skip).limit(Number(limit));
    const total = await Product.countDocuments(query);
    res.json({ products, page: Number(page), totalPages: Math.ceil(total / Number(limit)), total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/featured
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ rating: -1 }).limit(4);
    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const category = await Category.findById(product.category);
    const reviews = await Review.find({ product: product._id }).sort({ createdAt: -1 });
    res.json({ product, category, reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products (admin)
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/products/:id (admin)
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/products/:id (admin - soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function recalcProductRating(productId) {
  const reviews = await Review.find({ product: productId });
  const product = await Product.findById(productId);
  if (!product) return;
  product.numReviews = reviews.length;
  product.rating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;
  await product.save();
}

// POST /api/products/:id/reviews
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const existing = await Review.findOne({ user: req.user._id, product: req.params.id });
    if (existing) return res.status(400).json({ message: 'You have already reviewed this product' });
    const review = await Review.create({
      user: req.user._id,
      userName: req.user.name,
      product: req.params.id,
      rating: Number(rating),
      comment,
    });
    await recalcProductRating(req.params.id);
    res.status(201).json({ review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/products/:id/reviews/:reviewId
router.put('/:id/reviews/:reviewId', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findOne({ _id: req.params.reviewId, user: req.user._id, product: req.params.id });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    review.rating = Number(rating);
    review.comment = comment;
    await review.save();
    await recalcProductRating(req.params.id);
    res.json({ review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/products/:id/reviews/:reviewId
router.delete('/:id/reviews/:reviewId', protect, async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.reviewId, user: req.user._id, product: req.params.id });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    await recalcProductRating(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
