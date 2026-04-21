# launchliftmedias.com

A full-stack application for managing influencer-event collaborations with a React web app, React Native mobile app, and Node.js backend.
![Platform Preview](docs/preview.png)
## Features
### Admin Portal (Web)
- 🔐 Secure admin authentication
- 📅 Create, edit, and manage events
- 👥 Manage influencer profiles and categories
- 📊 Dashboard with analytics and top performers
- ✅ Review and approve applications
- 🏷️ Category management for events and influencers
- 👤 Admin user management (only admins can add new admins)
### Influencer App (Mobile)
- 🔗 Social media OAuth login (Facebook, Instagram, Google, Twitter)
- 🏠 Home feed with current and upcoming events
- 📝 Apply for events
- 📊 Profile with synced follower counts from social platforms
- 📋 Track application status
### Public Website
- 🌐 Browse events and influencers
- 🔍 Search and filter by region, category
- 👀 View event details and participating influencers
## Tech Stack
- **Backend**: Node.js, Express, MongoDB, Socket.io
- **Web Frontend**: React, Vite, TailwindCSS, React Query
- **Mobile App**: React Native, Expo
- **Authentication**: JWT, Passport.js OAuth
## Quick Start
### Prerequisites
- Node.js 18+
- MongoDB
- npm or yarn
### Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
npm install
npm run seed  # Create default admin and categories
npm run dev
