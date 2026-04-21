const express = require('express');
const Event = require('../models/Event');
const Influencer = require('../models/Influencer');
const router = express.Router();
// Public homepage data
router.get('/homepage', async (req, res, next) => {
  try {
    const { region } = req.query;
    const regionFilter = region ? { region } : {};
    const [currentEvents, upcomingEvents, topInfluencers, completedEvents] = await Promise.all([
      // Current/ongoing events
      Event.find({
        ...regionFilter,
        status: 'ongoing',
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      })
        .populate('categories')
        .sort({ viewsCount: -1 })
        .limit(6),
      // Upcoming events
      Event.find({
        ...regionFilter,
        status: 'published',
        startDate: { $gt: new Date() }
      })
        .populate('categories')
        .sort({ startDate: 1 })
        .limit(6),
      // Top influencers with completed events
      Influencer.find({
        ...regionFilter,
        completedEvents: { $gt: 0 }
      })
        .populate('user', 'name avatar')
        .populate('categories')
        .sort({ completedEvents: -1, rating: -1 })
        .limit(8),
      // Recently completed events (for showcase)
      Event.find({
        ...regionFilter,
        status: 'completed'
      })
        .populate('categories')
        .populate({
          path: 'assignedInfluencers.influencer',
          populate: { path: 'user', select: 'name avatar' }
        })
        .sort({ endDate: -1 })
        .limit(4)
    ]);
    res.json({
      success: true,
      data: {
        currentEvents,
        upcomingEvents,
        topInfluencers,
        completedEvents
      }
    });
  } catch (error) {
    next(error);
  }
});
// Public event details
router.get('/events/:id', async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('categories')
      .populate({
        path: 'assignedInfluencers.influencer',
        match: { 'assignedInfluencers.status': 'confirmed' },
        populate: { path: 'user', select: 'name avatar' }
      });
    if (!event || event.status === 'draft') {
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
// Public influencer profile
router.get('/influencers/:id', async (req, res, next) => {
  try {
    const influencer = await Influencer.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('categories');
    if (!influencer) {
      return res.status(404).json({
        success: false,
        error: 'Influencer not found'
      });
    }
    // Get completed events
    const completedEvents = await Event.find({
      'assignedInfluencers.influencer': influencer._id,
      status: 'completed'
    })
      .populate('categories')
      .sort({ endDate: -1 })
      .limit(6);
    res.json({
      success: true,
      data: {
        ...influencer.toObject(),
        recentEvents: completedEvents
      }
    });
  } catch (error) {
    next(error);
  }
});
// Search events
router.get('/search/events', async (req, res, next) => {
  try {
    const { q, region, category, page = 1, limit = 20 } = req.query;
    const query = {
      status: { $in: ['published', 'ongoing'] }
    };
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ];
    }
    if (region) query.region = region;
    if (category) query.categories = category;
    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('categories')
      .sort({ startDate: 1 })
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
// Get regions list
router.get('/regions', async (req, res, next) => {
  try {
    const regions = await Event.distinct('region');
    res.json({
      success: true,
      data: regions.sort()
    });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
