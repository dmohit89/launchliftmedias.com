const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Influencer = require('../models/Influencer');
const Event = require('../models/Event');
const Application = require('../models/Application');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();
// All routes require admin authentication
router.use(protect, authorize('admin'));
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
// Dashboard stats
router.get('/dashboard', async (req, res, next) => {
  try {
    const { region } = req.query;
    const regionFilter = region ? { region } : {};
    const [
      totalInfluencers,
      totalEvents,
      activeEvents,
      pendingApplications,
      topInfluencers,
      topEvents,
      recentApplications
    ] = await Promise.all([
      Influencer.countDocuments(regionFilter),
      Event.countDocuments(regionFilter),
      Event.countDocuments({ ...regionFilter, status: { $in: ['published', 'ongoing'] } }),
      Application.countDocuments({ status: 'pending' }),
      Influencer.find(regionFilter)
        .sort({ totalFollowers: -1, completedEvents: -1 })
        .limit(10)
        .populate('user', 'name email avatar')
        .populate('categories'),
      Event.find({ ...regionFilter, status: { $in: ['published', 'ongoing'] } })
        .sort({ viewsCount: -1, applicationsCount: -1 })
        .limit(10)
        .populate('categories'),
      Application.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate({
          path: 'influencer',
          populate: { path: 'user', select: 'name email avatar' }
        })
        .populate('event', 'title')
    ]);
    res.json({
      success: true,
      data: {
        stats: {
          totalInfluencers,
          totalEvents,
          activeEvents,
          pendingApplications
        },
        topInfluencers,
        topEvents,
        recentApplications
      }
    });
  } catch (error) {
    next(error);
  }
});
// Create new admin (only admins can create admins)
router.post('/create-admin', validate([
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required')
]), async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }
    const admin = await User.create({
      email,
      password,
      name,
      role: 'admin',
      createdBy: req.user._id
    });
    res.status(201).json({
      success: true,
      data: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
});
// Get all admins
router.get('/admins', async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      data: admins
    });
  } catch (error) {
    next(error);
  }
});
// Remove admin
router.delete('/admins/:id', async (req, res, next) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }
    if (admin.role !== 'admin') {
      return res.status(400).json({
        success: false,
        error: 'User is not an admin'
      });
    }
    // Prevent deleting self
    if (admin._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }
    await admin.deleteOne();
    res.json({
      success: true,
      message: 'Admin removed successfully'
    });
  } catch (error) {
    next(error);
  }
});
// Get all influencers with filters
router.get('/influencers', async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      region,
      category,
      search,
      sortBy = 'totalFollowers',
      order = 'desc',
      verified
    } = req.query;
    const query = {};
    if (region) query.region = region;
    if (category) query.categories = category;
    if (verified !== undefined) query.verified = verified === 'true';
    if (search) {
      const users = await User.find({
        role: 'influencer',
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      query.user = { $in: users.map(u => u._id) };
    }
    const total = await Influencer.countDocuments(query);
    
    const influencers = await Influencer.find(query)
      .populate('user', 'name email avatar isActive')
      .populate('categories')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({
      success: true,
      data: influencers,
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
// Update influencer categories
router.put('/influencers/:id/categories', validate([
  body('categories').isArray().withMessage('Categories must be an array')
]), async (req, res, next) => {
  try {
    const influencer = await Influencer.findById(req.params.id);
    if (!influencer) {
      return res.status(404).json({
        success: false,
        error: 'Influencer not found'
      });
    }
    influencer.categories = req.body.categories;
    await influencer.save();
    const updated = await Influencer.findById(influencer._id)
      .populate('user', 'name email avatar')
      .populate('categories');
    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    next(error);
  }
});
// Verify/unverify influencer
router.put('/influencers/:id/verify', async (req, res, next) => {
  try {
    const influencer = await Influencer.findById(req.params.id);
    if (!influencer) {
      return res.status(404).json({
        success: false,
        error: 'Influencer not found'
      });
    }
    influencer.verified = !influencer.verified;
    await influencer.save();
    res.json({
      success: true,
      data: influencer
    });
  } catch (error) {
    next(error);
  }
});
// Activate/deactivate influencer
router.put('/influencers/:id/status', async (req, res, next) => {
  try {
    const influencer = await Influencer.findById(req.params.id)
      .populate('user');
    if (!influencer) {
      return res.status(404).json({
        success: false,
        error: 'Influencer not found'
      });
    }
    influencer.user.isActive = !influencer.user.isActive;
    await influencer.user.save();
    res.json({
      success: true,
      data: {
        isActive: influencer.user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
});
// Remove influencer
router.delete('/influencers/:id', async (req, res, next) => {
  try {
    const influencer = await Influencer.findById(req.params.id);
    if (!influencer) {
      return res.status(404).json({
        success: false,
        error: 'Influencer not found'
      });
    }
    // Remove associated user
    await User.findByIdAndDelete(influencer.user);
    
    // Remove all applications
    await Application.deleteMany({ influencer: influencer._id });
    
    // Remove influencer from events
    await Event.updateMany(
      { 'assignedInfluencers.influencer': influencer._id },
      { $pull: { assignedInfluencers: { influencer: influencer._id } } }
    );
    
    await influencer.deleteOne();
    res.json({
      success: true,
      message: 'Influencer removed successfully'
    });
  } catch (error) {
    next(error);
  }
});
// Assign influencer to event
router.post('/events/:eventId/assign/:influencerId', async (req, res, next) => {
  try {
    const { eventId, influencerId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    const influencer = await Influencer.findById(influencerId);
    if (!influencer) {
      return res.status(404).json({
        success: false,
        error: 'Influencer not found'
      });
    }
    // Check if already assigned
    const alreadyAssigned = event.assignedInfluencers.some(
      a => a.influencer.toString() === influencerId
    );
    if (alreadyAssigned) {
      return res.status(400).json({
        success: false,
        error: 'Influencer already assigned to this event'
      });
    }
    event.assignedInfluencers.push({
      influencer: influencerId,
      status: 'assigned'
    });
    await event.save();
    // Update application status if exists
    await Application.findOneAndUpdate(
      { event: eventId, influencer: influencerId },
      { status: 'approved', reviewedBy: req.user._id, reviewedAt: new Date() }
    );
    // Emit socket event
    const io = req.app.get('io');
    io.to(`influencer-${influencer.user}`).emit('event-assigned', {
      eventId,
      eventTitle: event.title
    });
    res.json({
      success: true,
      message: 'Influencer assigned successfully'
    });
  } catch (error) {
    next(error);
  }
});
// Remove influencer from event
router.delete('/events/:eventId/assign/:influencerId', async (req, res, next) => {
  try {
    const { eventId, influencerId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    event.assignedInfluencers = event.assignedInfluencers.filter(
      a => a.influencer.toString() !== influencerId
    );
    await event.save();
    res.json({
      success: true,
      message: 'Influencer removed from event'
    });
  } catch (error) {
    next(error);
  }
});
// Get regions with stats
router.get('/regions', async (req, res, next) => {
  try {
    const influencersByRegion = await Influencer.aggregate([
      { $group: { _id: '$region', count: { $sum: 1 } } }
    ]);
    const eventsByRegion = await Event.aggregate([
      { $group: { _id: '$region', count: { $sum: 1 } } }
    ]);
    const regions = new Set([
      ...influencersByRegion.map(r => r._id),
      ...eventsByRegion.map(r => r._id)
    ]);
    const data = Array.from(regions).map(region => ({
      name: region,
      influencers: influencersByRegion.find(r => r._id === region)?.count || 0,
      events: eventsByRegion.find(r => r._id === region)?.count || 0
    }));
    res.json({
      success: true,
      data: data.sort((a, b) => b.influencers - a.influencers)
    });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
