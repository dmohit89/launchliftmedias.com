onst mongoose = require('mongoose');
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  coverImage: {
    type: String,
    default: null
  },
  images: [{
    type: String
  }],
  region: {
    type: String,
    required: [true, 'Region is required'],
    index: true
  },
  location: {
    venue: String,
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  applicationDeadline: {
    type: Date,
    required: [true, 'Application deadline is required']
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  capacity: {
    type: Number,
    default: null
  },
  requirements: {
    minFollowers: {
      type: Number,
      default: 0
    },
    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }],
    description: String
  },
  compensation: {
    type: {
      type: String,
      enum: ['paid', 'product', 'exposure', 'mixed'],
      default: 'exposure'
    },
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    description: String
  },
  organizer: {
    name: String,
    email: String,
    phone: String,
    company: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedInfluencers: [{
    influencer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Influencer'
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['assigned', 'confirmed', 'completed', 'cancelled'],
      default: 'assigned'
    }
  }],
  applicationsCount: {
    type: Number,
    default: 0
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});
// Indexes
eventSchema.index({ status: 1, startDate: 1 });
eventSchema.index({ region: 1, status: 1 });
eventSchema.index({ categories: 1 });
eventSchema.index({ featured: 1, startDate: 1 });
eventSchema.index({ createdAt: -1 });
// Virtual for checking if event is upcoming
eventSchema.virtual('isUpcoming').get(function() {
  return this.startDate > new Date();
});
// Virtual for checking if applications are open
eventSchema.virtual('acceptingApplications').get(function() {
  return this.applicationDeadline > new Date() && this.status === 'published';
});
module.exports = mongoose.model('Event', eventSchema);
