const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const Influencer = require('../models/Influencer');
const socialCallback = async (platform) => async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    
    if (!email) {
      return done(new Error(`No email provided by ${platform}`), null);
    }
    let user = await User.findOne({ email });
    let influencer;
    if (!user) {
      // Create new user
      user = await User.create({
        email,
        name: profile.displayName || profile.name?.givenName || 'User',
        avatar: profile.photos?.[0]?.value,
        role: 'influencer'
      });
      // Create influencer profile
      influencer = await Influencer.create({
        user: user._id,
        region: 'Global',
        socialMedia: [{
          platform: platform.toLowerCase(),
          username: profile.username || profile.displayName,
          profileUrl: profile.profileUrl || `[${platform}.com](https://${platform}.com/${profile.id})`,
          accessToken,
          refreshToken,
          followers: profile._json?.followers_count || 0,
          friends: profile._json?.friends_count || 0
        }]
      });
      influencer.calculateTotalFollowers();
      await influencer.save();
    } else {
      // Update existing user's social media
      influencer = await Influencer.findOne({ user: user._id });
      
      if (influencer) {
        const existingPlatform = influencer.socialMedia.find(
          sm => sm.platform === platform.toLowerCase()
        );
        if (existingPlatform) {
          existingPlatform.accessToken = accessToken;
          existingPlatform.refreshToken = refreshToken;
          existingPlatform.followers = profile._json?.followers_count || existingPlatform.followers;
          existingPlatform.friends = profile._json?.friends_count || existingPlatform.friends;
        } else {
          influencer.socialMedia.push({
            platform: platform.toLowerCase(),
            username: profile.username || profile.displayName,
            profileUrl: profile.profileUrl || `[${platform}.com](https://${platform}.com/${profile.id})`,
            accessToken,
            refreshToken,
            followers: profile._json?.followers_count || 0,
            friends: profile._json?.friends_count || 0
          });
        }
        influencer.calculateTotalFollowers();
        await influencer.save();
      }
    }
    user.lastLogin = new Date();
    await user.save();
    return done(null, { user, influencer });
  } catch (error) {
    return done(error, null);
  }
};
// Facebook Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: '/api/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'photos', 'email', 'friends']
  }, socialCallback('Facebook')));
}
// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  }, socialCallback('Google')));
}
passport.serializeUser((data, done) => {
  done(null, data.user._id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
module.exports = passport;
