import express from 'express';
import Wishlist from '../models/Wishlist.js';

const router = express.Router();

// GET /api/wishlist
router.get('/', async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
    if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    res.json({ products: wishlist.products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/wishlist/toggle
router.post('/toggle', async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    const idx = wishlist.products.findIndex((p) => p.toString() === productId);
    if (idx >= 0) {
      wishlist.products.splice(idx, 1);
    } else {
      wishlist.products.push(productId);
    }
    await wishlist.save();
    res.json({ inWishlist: wishlist.products.some((p) => p.toString() === productId) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
