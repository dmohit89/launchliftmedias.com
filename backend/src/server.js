const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const eventRoutes = require('./routes/events');
const influencerRoutes = require('./routes/influencers');
const categoryRoutes = require('./routes/categories');
const applicationRoutes = require('./routes/applications');
const publicRoutes = require('./routes/public');
// Import passport config
require('./config/passport');
// Import error handler
const errorHandler = require('./middleware/errorHandler');
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [process.env.WEB_URL, '[localhost](http://localhost:3000)', '[localhost](http://localhost:19006)'],
    methods: ['GET', 'POST']
  }
});
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
// Middleware
app.use(helmet());
app.use(cors({
  origin: [process.env.WEB_URL, '[localhost](http://localhost:3000)', '[localhost](http://localhost:19006)'],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use('/api', limiter);
// Make io accessible to routes
app.set('io', io);
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/influencers', influencerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/public', publicRoutes);
// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Error handler
app.use(errorHandler);
// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-room', (room) => {
    socket.join(room);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});
// Database connection and server start
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
module.exports = { app, io };
