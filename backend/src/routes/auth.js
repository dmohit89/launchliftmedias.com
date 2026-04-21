const express = require('express');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Influencer = require('../models/Influencer');
const { protect } = require('../middleware/auth');
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
// Admin login
router.post('/admin/login', validate([
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
]), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: 'admin' }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
    }
    user.lastLogin = new Date();
    await user.save();
    const token = user.generateAuthToken();
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
});
// Get current user
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let influencer = null;
    if (user.role === 'influencer') {
      influencer = await Influencer.findOne({ user: user._id })
        .populate('categories');
    }
    res.json({
      success: true,
      user,
      influencer
    });
  } catch (error) {
    next(error);
  }
});
// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', {
  scope: ['email', 'public_profile', 'user_friends']
}));
router.get('/facebook/callback', passport.authenticate('facebook', {
  session: false,
  failureRedirect: `${process.env.WEB_URL}/login?error=auth_failed`
}), (req, res) => {
  const token = req.user.user.generateAuthToken();
  res.redirect(`${process.env.WEB_URL}/auth/callback?token=${token}`);
});
// Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));
router.get('/google/callback', passport.authenticate('google', {
  session: false,
  failureRedirect: `${process.env.WEB_URL}/login?error=auth_failed`
}), (req, res) => {
  const token = req.user.user.generateAuthToken();
  res.redirect(`${process.env.WEB_URL}/auth/callback?token=${token}`);
});
// Mobile OAuth callback
router.post('/social/mobile', validate([
  body('platform').isIn(['facebook', 'google', 'instagram', 'twitter']),
  body('accessToken').notEmpty(),
  body('profile').isObject()
]), async (req, res, next) => {
  try {
    const { platform, accessToken, refreshToken, profile } = req.body;
    const email = profile.email;
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    let user = await User.findOne({ email });
    let influencer;
    if (!user) {
      user = await User.create({
        email,
        name: profile.name || 'User',
        avatar: profile.avatar,
        role: 'influencer'
      });
      influencer = await Influencer.create({
        user: user._id,
        region: 'Global',
        socialMedia: [{
          platform,
          username: profile.username || profile.name,
          profileUrl: profile.profileUrl || '',
          accessToken,
          refreshToken,
          followers: profile.followers || 0,
          friends: profile.friends || 0
        }]
      });
      influencer.calculateTotalFollowers();
      await influencer.save();
    } else {
      influencer = await Influencer.findOne({ user: user._id });
      
      if (influencer) {
        const existingPlatform = influencer.socialMedia.find(
          sm => sm.platform === platform
        );
        if (existingPlatform) {
          existingPlatform.accessToken = accessToken;
          existingPlatform.refreshToken = refreshToken;
          existingPlatform.followers = profile.followers || existingPlatform.followers;
          existingPlatform.friends = profile.friends || existingPlatform.friends;
        } else {
          influencer.socialMedia.push({
            platform,
            username: profile.username || profile.name,
            profileUrl: profile.profileUrl || '',
            accessToken,
            refreshToken,
            followers: profile.followers || 0,
            friends: profile.friends || 0
          });
        }
        influencer.calculateTotalFollowers();
        await influencer.save();
      }
    }
    user.lastLogin = new Date();
    await user.save();
    const token = user.generateAuthToken();
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      },
      influencer
    });
  } catch (error) {
    next(error);
  }
});
// Logout (client-side token removal)
router.post('/logout', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});
module.exports = router;
