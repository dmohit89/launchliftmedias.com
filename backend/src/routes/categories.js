const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();
// Get all categories
router.get('/', async (req, res, next) => {
  try {
    const { type, active } = req.query;
    const query = {};
    if (type) query.type = { $in: [type, 'both'] };
    if (active !== undefined) query.isActive = active === 'true';
    const categories = await Category.find(query).sort({ order: 1, name: 1 });
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
});
// Create category (admin only)
router.post('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
});
// Update category (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
});
// Delete category (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    // Remove category from influencers and events
    const Influencer = require('../models/Influencer');
    const Event = require('../models/Event');
    await Influencer.updateMany(
      { categories: category._id },
      { $pull: { categories: category._id } }
    );
    await Event.updateMany(
      { categories: category._id },
      { $pull: { categories: category._id } }
    );
    await category.deleteOne();
    res.json({
      success: true,
      message: 'Category deleted'
    });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
