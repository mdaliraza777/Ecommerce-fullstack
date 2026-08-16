import express from 'express';
import Cart from '../models/Cart.js';

const router = express.Router();

// GET /api/cart
router.get('/', async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/cart
router.post('/', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
    const existing = cart.items.find((i) => i.product.toString() === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    await cart.save();
    cart = await cart.populate('items.product');
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/cart/:productId
router.put('/:productId', async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    const item = cart.items.find((i) => i.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    } else {
      item.quantity = quantity;
    }
    await cart.save();
    const populated = await cart.populate('items.product');
    res.json({ cart: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/cart/:productId
router.delete('/:productId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    await cart.save();
    const populated = await cart.populate('items.product');
    res.json({ cart: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/cart
router.delete('/', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items = [];
    await cart.save();
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
