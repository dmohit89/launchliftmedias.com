const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const Application = require('../models/Application');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const router = express.Router();
// Validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    res.status(400).json({
      success: false,
      errors: errors.array().map(e => e.msg)
    });
  };
};
const eventValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('region').notEmpty().withMessage('Region is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('applicationDeadline').isISO8601().withMessage('Valid application deadline is required')
];
// Get all events (with filters)
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      region,
      category,
      search,
      featured,
      upcoming,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;
    const query = {};
    // Only admins can see drafts
    if (req.user?.role !== 'admin') {
      query.status = { $ne: 'draft' };
    }
    if (status) query.status = status;
    if (region) query.region = region;
    if (category) query.categories = category;
    if (featured === 'true') query.featured = true;
    if (upcoming === 'true') query.startDate = { $gt: new Date() };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('categories')
      .populate('createdBy', 'name')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({
      success: true,
      data: events,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});
// Get single event
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('categories')
      .populate('createdBy', 'name email')
      .populate({
        path: 'assignedInfluencers.influencer',
        populate: { path: 'user', select: 'name avatar' }
      });
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    // Check if draft and not admin
    if (event.status === 'draft' && req.user?.role !== 'admin') {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    // Increment view count
    event.viewsCount += 1;
    await event.save();
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
});
// Create event (admin only)
router.post('/', protect, authorize('admin'), validate(eventValidation), async (req, res, next) => {
  try {
    const event = await Event.create({
      ...req.body,
      createdBy: req.user._id
    });
    const populated = await Event.findById(event._id)
      .populate('categories')
      .populate('createdBy', 'name');
    // Emit socket event for new event
    const io = req.app.get('io');
    io.emit('new-event', {
      id: event._id,
      title: event.title,
      region: event.region
    });
    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    next(error);
  }
});
// Update event (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    // Prevent updating completed/cancelled events
    if (['completed', 'cancelled'].includes(event.status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot update ${event.status} events`
      });
    }
    event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('categories').populate('createdBy', 'name');
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
});
// Delete event (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    // Delete associated applications
    await Application.deleteMany({ event: event._id });
    await event.deleteOne();
    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});
// Update event status
router.patch('/:id/status', protect, authorize('admin'), validate([
  body('status').isIn(['draft', 'published', 'ongoing', 'completed', 'cancelled'])
]), async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    event.status = req.body.status;
    await event.save();
    // If completed, update influencer stats
    if (req.body.status === 'completed') {
      const Influencer = require('../models/Influencer');
      const influencerIds = event.assignedInfluencers
        .filter(a => a.status === 'confirmed')
        .map(a => a.influencer);
      await Influencer.updateMany(
        { _id: { $in: influencerIds } },
        { $inc: { completedEvents: 1 } }
      );
    }
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
});
// Toggle featured status
router.patch('/:id/featured', protect, authorize('admin'), async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    event.featured = !event.featured;
    await event.save();
    res.json({
      success: true,
      data: { featured: event.featured }
    });
  } catch (error) {
    next(error);
  }
});
// Get event applications (admin only)
router.get('/:id/applications', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { event: req.params.id };
    if (status) query.status = status;
    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .populate({
        path: 'influencer',
        populate: [
          { path: 'user', select: 'name email avatar' },
          { path: 'categories' }
        ]
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({
      success: true,
      data: applications,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
