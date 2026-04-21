const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  type: {
    type: String,
    enum: ['influencer', 'event', 'both'],
    default: 'both'
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  icon: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});
// Generate slug before saving
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  next();
});
module.exports = mongoose.model('Category', categorySchema);
