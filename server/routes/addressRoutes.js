import express from 'express';
import Address from '../models/Address.js';

const router = express.Router();

// GET /api/addresses
router.get('/', async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json({ addresses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/addresses
router.post('/', async (req, res) => {
  try {
    const { isDefault, ...rest } = req.body;
    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }
    const address = await Address.create({ user: req.user._id, ...req.body });
    res.status(201).json({ address });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/addresses/:id
router.put('/:id', async (req, res) => {
  try {
    const existing = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!existing) return res.status(404).json({ message: 'Address not found' });
    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }
    const address = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ address });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/addresses/:id
router.delete('/:id', async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!address) return res.status(404).json({ message: 'Address not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
