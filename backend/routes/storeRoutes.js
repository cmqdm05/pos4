import express from 'express';
import Store from '../models/storeModel.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create store
router.post('/', protect, async (req, res) => {
  try {
    const { name, address, phone } = req.body;
    const store = await Store.create({
      name,
      address,
      phone,
      owner: req.user._id
    });
    res.status(201).json(store);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's stores
router.get('/', protect, async (req, res) => {
  try {
    const stores = await Store.find({ owner: req.user._id });
    res.json(stores);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get store by id
router.get('/:id', protect, async (req, res) => {
  try {
    const store = await Store.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    if (store) {
      res.json(store);
    } else {
      res.status(404).json({ message: 'Store not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update store
router.put('/:id', protect, async (req, res) => {
  try {
    const store = await Store.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (store) {
      store.name = req.body.name || store.name;
      store.address = req.body.address || store.address;
      store.phone = req.body.phone || store.phone;

      const updatedStore = await store.save();
      res.json(updatedStore);
    } else {
      res.status(404).json({ message: 'Store not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete store
router.delete('/:id', protect, async (req, res) => {
  try {
    const store = await Store.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (store) {
      await store.remove();
      res.json({ message: 'Store removed' });
    } else {
      res.status(404).json({ message: 'Store not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;