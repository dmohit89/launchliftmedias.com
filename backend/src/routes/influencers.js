const express = require('express');
const { body } = require('express-validator');
const Influencer = require('../models/Influencer');
const Application = require('../models/Application');
const Event = require('../models/Event');
const { protect, authorize } = require('../middleware/auth');
const axios = require('axios');
const router = express.Router();
// Get current influencer profile
router.get('/profile', protect, authorize('influencer'), async (req, res, next) => {
  try {
    const influencer = await Influencer.findOne({ user: req.user._id })
      .populate('user', 'name email avatar')
      .populate('categories');
    if (!influencer) {
      return res.status(404).json({
        success: false,
        error: 'Influencer profile not found'
      });
    }
    res.json({
      success: true,
      data: influencer
    });
  } catch (error) {
    next(error);
  }
});
// Update influencer profile
router.put('/profile', protect, authorize('influencer'), async (req, res, next) => {
  try {
    const allowedUpdates = ['bio', 'region', 'city', 'country', 'featuredImage'];
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    const influencer = await Influencer.findOneAndUpdate(
      { user: req.user._id },
      updates,
      { new: true, runValidators: true }
    ).populate('user', 'name email avatar').populate('categories');
    if (!influencer) {
      return res.status(404).json({
        success: false,
        error: 'Influencer profile not found'
      });
    }
    res.json({
      success: true,
      data: influencer
    });
  } catch (error) {
    next(error);
  }
});
// Sync social media followers
router.post('/sync-social', protect, authorize('influencer'), async (req, res, next) => {
  try {
    const influencer = await Influencer.findOne({ user: req.user._id })
      .select('+socialMedia.accessToken');
    if (!influencer) {
      return res.status(404).json({
        success: false,
        error: 'Influencer profile not found'
      });
    }
    // Sync each connected platform
    for (const social of influencer.socialMedia) {
      try {
        let followers = 0;
        let friends = 0;
        switch (social.platform) {
          case 'facebook':
            if (social.accessToken) {
              const fbResponse = await axios.get(
                `[graph.facebook.com](https://graph.facebook.com/me?fields=friends&access_token=${social.accessToken})`
              );
              friends = fbResponse.data?.friends?.summary?.total_count || 0;
            }
            break;
          case 'instagram':
            if (social.accessToken) {
              const igResponse = await axios.get(
                `[graph.instagram.com](https://graph.instagram.com/me?fields=followers_count&access_token=${social.accessToken})`
              );
              followers = igResponse.data?.followers_count || 0;
            }
            break;
          // Add more platforms as needed
        }
        social.followers = followers || social.followers;
        social.friends = friends || social.friends;
        social.lastSynced = new Date();
      } catch (err) {
        console.error(`Failed to sync ${social.platform}:`, err.message);
      }
    }
    influencer.calculateTotalFollowers();
    await influencer.save();
    // Return without tokens
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
// Connect social media account
router.post('/connect-social', protect, authorize('influencer'), async (req, res, next) => {
  try {
    const { platform, accessToken, refreshToken, profile } = req.body;
    const influencer = await Influencer.findOne({ user: req.user._id });
    if (!influencer) {
      return res.status(404).json({
        success: false,
        error: 'Influencer profile not found'
      });
    }
    const existingIndex = influencer.socialMedia.findIndex(
      sm => sm.platform === platform
    );
    const socialData = {
      platform,
      username: profile.username,
      profileUrl: profile.profileUrl,
      accessToken,
      refreshToken,
      followers: profile.followers || 0,
      friends: profile.friends || 0,
      lastSynced: new Date()
    };
    if (existingIndex >= 0) {
      influencer.socialMedia[existingIndex] = socialData;
    } else {
      influencer.socialMedia.push(socialData);
    }
    influencer.calculateTotalFollowers();
    await influencer.save();
    res.json({
      success: true,
      message: `${platform} connected successfully`
    });
  } catch (error) {
    next(error);
  }
});
// Disconnect social media account
router.delete('/disconnect-social/:platform', protect, authorize('influencer'), async (req, res, next) => {
  try {
    const influencer = await Influencer.findOne({ user: req.user._id });
    if (!influencer) {
      return res.status(404).json({
        success: false,
        error: 'Influencer profile not found'
      });
    }
    influencer.socialMedia = influencer.socialMedia.filter(
      sm => sm.platform !== req.params.platform
    );
    influencer.calculateTotalFollowers();
    await influencer.save();
    res.json({
      success: true,
      message: 'Social media disconnected'
    });
  } catch (error) {
    next(error);
  }
});
// Get influencer's applications
router.get('/applications', protect, authorize('influencer'), async (req, res, next) => {
  try {
    const influencer = await Influencer.findOne({ user: req.user._id });
    if (!influencer) {
      return res.status(404).json({
        success: false,
        error: 'Influencer profile not found'
      });
    }
    const { status, page = 1, limit = 20 } = req.query;
    const query = { influencer: influencer._id };
    if (status) query.status = status;
    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .populate({
        path: 'event',
        populate: { path: 'categories' }
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
// Get influencer's assigned events
router.get('/events', protect, authorize('influencer'), async (req, res, next) => {
  try {
    const influencer = await Influencer.findOne({ user: req.user._id });
    if (!influencer) {
      return res.status(404).json({
        success: false,
        error: 'Influencer profile not found'
      });
    }
    const { status, page = 1, limit = 20 } = req.query;
    const query = {
      'assignedInfluencers.influencer': influencer._id
    };
    if (status) {
      query['assignedInfluencers.status'] = status;
    }
    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('categories')
      .sort({ startDate: -1 })
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
// Add portfolio item
router.post('/portfolio', protect, authorize('influencer'), async (req, res, next) => {
  try {
    const { title, description, imageUrl, eventId } = req.body;
    const influencer = await Influencer.findOne({ user: req.user._id });
    if (!influencer) {
      return res.status(404).json({
        success: false,
        error: 'Influencer profile not found'
      });
    }
    influencer.portfolio.push({
      title,
      description,
      imageUrl,
      eventId
    });
    await influencer.save();
    res.status(201).json({
      success: true,
      data: influencer.portfolio
    });
  } catch (error) {
    next(error);
  }
});
// Remove portfolio item
router.delete('/portfolio/:itemId', protect, authorize('influencer'), async (req, res, next) => {
  try {
    const influencer = await Influencer.findOne({ user: req.user._id });
    if (!influencer) {
      return res.status(404).json({
        success: false,
        error: 'Influencer profile not found'
      });
    }
    influencer.portfolio = influencer.portfolio.filter(
      item => item._id.toString() !== req.params.itemId
    );
    await influencer.save();
    res.json({
      success: true,
      message: 'Portfolio item removed'
    });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
