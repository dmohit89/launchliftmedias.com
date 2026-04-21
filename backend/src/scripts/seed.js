require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Category = require('../models/Category');
const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    // Create default admin
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
    
    if (!adminExists) {
      await User.create({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        name: 'Super Admin',
        role: 'admin'
      });
      console.log('Default admin created');
    }
    // Create default categories
    const defaultCategories = [
      { name: 'Fashion', type: 'both', icon: '👗', color: '#ec4899' },
      { name: 'Technology', type: 'both', icon: '💻', color: '#3b82f6' },
      { name: 'Food & Beverage', type: 'both', icon: '🍕', color: '#f97316' },
      { name: 'Travel', type: 'both', icon: '✈️', color: '#14b8a6' },
      { name: 'Fitness', type: 'both', icon: '💪', color: '#ef4444' },
      { name: 'Beauty', type: 'both', icon: '💄', color: '#d946ef' },
      { name: 'Gaming', type: 'both', icon: '🎮', color: '#8b5cf6' },
      { name: 'Music', type: 'both', icon: '🎵', color: '#06b6d4' },
      { name: 'Sports', type: 'both', icon: '⚽', color: '#22c55e' },
      { name: 'Lifestyle', type: 'both', icon: '🌟', color: '#f59e0b' },
      { name: 'Business', type: 'both', icon: '💼', color: '#64748b' },
      { name: 'Education', type: 'both', icon: '📚', color: '#0ea5e9' }
    ];
    for (const cat of defaultCategories) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create(cat);
        console.log(`Category "${cat.name}" created`);
      }
    }
    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};
seedDatabase();
