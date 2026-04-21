const express = require('express');
const { body, validationResult } = require('express-validator');
const Application = require('../models/Application');
const Event = require('../models/Event');
const Influencer = require('../models/Influencer');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();
// Apply for event (influencer only)
router.post('/', protect, authorize('influencer'), async (req, res, next) => {
  try {
    const { eventId, message } = req.body;
    const influencer = await Influencer.findOne({ user: req.user._id });
    if (!influencer) {
      return res.status(404).json({
        success: false,
        error: 'Influencer profile not found'
      });
    }
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    // Check if event is accepting applications
    if (event.status !== 'published') {
      return res.status(400).json({
        success: false,
        error: 'Event is not accepting applications'
      });
    }
    if (new Date() > event.applicationDeadline) {
      return res.status(400).json({
        success: false,
        error: 'Application deadline has passed'
      });
    }
    // Check minimum followers requirement
    if (event.requirements?.minFollowers && influencer.totalFollowers < event.requirements.minFollowers) {
      return res.status(400).json({
        success: false,
        error: `This event requires a minimum of ${event.requirements.minFollowers} followers`
      });
    }
    // Check if already applied
    const existingApplication = await Application.findOne({
      event: eventId,
      influencer: influencer._id
    });
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        error: 'You have already applied for this event'
      });
    }
    const application = await Application.create({
      event: eventId,
      influencer: influencer._id,
      message
    });
    // Update event application count
    event.applicationsCount += 1;
    await event.save();
    // Emit socket event
    const io = req.app.get('io');
    io.to('admin-room').emit('new-application', {
      eventId,
      eventTitle: event.title,
      influencerName: req.user.name
    });
    res.status(201).json({
      success: true,
      data: application
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'You have already applied for this event'
      });
    }
    next(error);
  }
});
// Withdraw application (influencer only)
router.delete('/:id', protect, authorize('influencer'), async (req, res, next) => {
  try {
    const influencer = await Influencer.findOne({ user: req.user._id });
    const application = await Application.findOne({
      _id: req.params.id,
      influencer: influencer._id
    });
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Cannot withdraw a processed application'
      });
    }
    application.status = 'withdrawn';
    await application.save();
    // Update event application count
    await Event.findByIdAndUpdate(application.event, {
      $inc: { applicationsCount: -1 }
    });
    res.json({
      success: true,
      message: 'Application withdrawn'
    });
  } catch (error) {
    next(error);
  }
});
// Review application (admin only)
router.put('/:id/review', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }
    const application = await Application.findById(req.params.id)
      .populate('event')
      .populate({
        path: 'influencer',
        populate: { path: 'user' }
      });
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Application has already been reviewed'
      });
    }
    application.status = status;
    application.adminNotes = adminNotes;
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    await application.save();
    // If approved, assign influencer to event
    if (status === 'approved') {
      await Event.findByIdAndUpdate(application.event._id, {
        $push: {
          assignedInfluencers: {
            influencer: application.influencer._id,
            status: 'assigned'
          }
        }
      });
    }
    // Emit socket event to influencer
    const io = req.app.get('io');
    io.to(`influencer-${application.influencer.user._id}`).emit('application-reviewed', {
      applicationId: application._id,
      eventTitle: application.event.title,
      status
    });
    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
});
// Get all applications (admin only)
router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
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
      .populate('event', 'title startDate region')
      .populate('reviewedBy', 'name')
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
