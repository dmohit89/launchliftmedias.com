const mongoose = require('mongoose');
const socialMediaSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: ['facebook', 'instagram', 'twitter', 'youtube', 'tiktok', 'linkedin'],
    required: true
  },
  username: {
    type: String,
    required: true
  },
  profileUrl: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    select: false
  },
  refreshToken: {
    type: String,
    select: false
  },
  followers: {
    type: Number,
    default: 0
  },
  friends: {
    type: Number,
    default: 0
  },
  engagement: {
    type: Number,
    default: 0
  },
  lastSynced: {
    type: Date,
    default: null
  }
}, { _id: false });
const influencerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  socialMedia: [socialMediaSchema],
  totalFollowers: {
    type: Number,
    default: 0
  },
  region: {
    type: String,
    required: [true, 'Region is required'],
    index: true
  },
  city: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  completedEvents: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  featuredImage: {
    type: String,
    default: null
  },
  portfolio: [{
    title: String,
    description: String,
    imageUrl: String,
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    }
  }]
}, {
  timestamps: true
});
// Calculate total followers from all platforms
influencerSchema.methods.calculateTotalFollowers = function() {
  this.totalFollowers = this.socialMedia.reduce((total, sm) => {
    return total + (sm.followers || 0) + (sm.friends || 0);
  }, 0);
  return this.totalFollowers;
};
// Index for efficient queries
influencerSchema.index({ region: 1, totalFollowers: -1 });
influencerSchema.index({ categories: 1 });
influencerSchema.index({ completedEvents: -1 });
module.exports = mongoose.model('Influencer', influencerSchema);
