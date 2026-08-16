import express from 'express';
import Category from '../models/Category.js';

const router = express.Router();

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/categories (admin)
router.post('/', async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ category });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
