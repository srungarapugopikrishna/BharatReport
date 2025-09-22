# JanataReport - Complete Setup Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start (Docker - Recommended)](#quick-start-docker---recommended)
4. [Manual Setup](#manual-setup)
5. [Project Structure](#project-structure)
6. [API Endpoints](#api-endpoints)
7. [Features](#features)
8. [Troubleshooting](#troubleshooting)
9. [Development](#development)

## 🎯 Project Overview

JanataReport is a full-stack civic issue reporting and tracking platform for India. Citizens can report civic issues, track their resolution, and view analytics. The platform supports multiple languages (English, Hindi, Telugu) and includes both regular and anonymous user registration.

### Key Features:
- **User Authentication**: Regular and anonymous user registration/login
- **Issue Reporting**: Report civic issues with photos, location, and detailed descriptions
- **Issue Tracking**: Track resolution status, upvote, and comment on issues
- **Analytics Dashboard**: View heatmaps, category-wise counts, resolution times
- **Admin Panel**: Manage categories, officials, and users
- **Multi-language Support**: English, Hindi, and Telugu
- **Location Services**: Google Maps integration for precise location tagging

## 🔧 Prerequisites

### Option 1: Docker (Recommended)
- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
- **Docker Compose** - Usually included with Docker Desktop

### Option 2: Manual Setup
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) with PostGIS extension
- **Python** (v3.8 or higher) - [Download here](https://www.python.org/)

## 🚀 Quick Start (Docker - Recommended)

### Step 1: Clone and Navigate
```bash
git clone <your-repo-url>
cd JantaReport
```

### Step 2: Start the Application
```bash
# Start all services
docker-compose up --build

# Or run in background
docker-compose up --build -d
```

### Step 3: Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: localhost:5432

### Step 4: Seed Initial Data
```bash
# Run the seed script to populate initial data
docker-compose exec backend node scripts/seed.js
```

### Step 5: Test the Application
1. Open http://localhost:3000
2. Register as anonymous user with name "TestUser"
3. Or register with email/password
4. Login and explore the features

## 🛠️ Manual Setup

### Step 1: Install Prerequisites
1. **Install Node.js** (v16+)
2. **Install PostgreSQL** with PostGIS extension
3. **Install Python** (v3.8+)

### Step 2: Database Setup
```bash
# Create PostgreSQL database
createdb janata_report

# Connect to database and enable PostGIS
psql janata_report
CREATE EXTENSION postgis;
\q
```

### Step 3: Backend Setup
```bash
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=janata_report
# DB_USER=your_username
# DB_PASSWORD=your_password
# JWT_SECRET=your_jwt_secret

# Run database migrations
npm run migrate

# Seed initial data
npm run seed

# Start backend server
npm start
```

### Step 4: Frontend Setup
```bash
cd client

# Install dependencies
npm install

# Start development server
npm start
```

## 📁 Project Structure

```
JantaReport/
├── client/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts (Auth, Language)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js Backend
│   ├── config/            # Database configuration
│   ├── middleware/        # Authentication, validation
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── scripts/          # Database seeding
│   ├── package.json
│   └── index.js
├── docker-compose.yml     # Docker orchestration
├── Dockerfile.backend    # Backend Docker image
├── Dockerfile.frontend   # Frontend Docker image
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Issues
- `GET /api/issues` - Get all issues (with filters)
- `POST /api/issues` - Create new issue
- `GET /api/issues/:id` - Get specific issue
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)

### Analytics
- `GET /api/analytics/dashboard` - Dashboard analytics
- `GET /api/analytics/categories` - Category-wise analytics
- `GET /api/analytics/heatmap` - Location heatmap data

### Officials
- `GET /api/officials` - Get all officials
- `POST /api/officials` - Create official (admin)
- `PUT /api/officials/:id` - Update official (admin)

## ✨ Features

### User Management
- **Regular Users**: Email/password registration
- **Anonymous Users**: Name-only registration for privacy
- **Role-based Access**: Citizen, Official, Admin roles
- **Profile Management**: Update user information

### Issue Management
- **Report Issues**: With photos, location, and detailed descriptions
- **Category System**: Predefined categories and subcategories
- **Status Tracking**: Pending, In Progress, Resolved, Closed
- **Priority Levels**: Low, Medium, High, Critical
- **Location Services**: Google Maps integration with PostGIS

### Analytics & Reporting
- **Dashboard**: Overview of all issues and statistics
- **Heatmaps**: Geographic distribution of issues
- **Category Analytics**: Issue distribution by category
- **Resolution Tracking**: Average resolution times
- **Official Performance**: Response rates and resolution rates

### Multi-language Support
- **English**: Default language
- **Hindi**: हिंदी support
- **Telugu**: తెలుగు support
- **Dynamic Switching**: Change language on the fly

### Admin Features
- **User Management**: View and manage all users
- **Category Management**: Add/edit categories and subcategories
- **Official Management**: Manage responsible officials
- **Analytics Dashboard**: Comprehensive reporting

## 🐛 Troubleshooting

### Common Issues

#### 1. Docker Issues
```bash
# If containers fail to start
docker-compose down
docker-compose up --build

# If port conflicts
# Check if ports 3000, 5000, 5432 are available
netstat -an | findstr :3000
netstat -an | findstr :5000
netstat -an | findstr :5432
```

#### 2. Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up --build
```

#### 3. Frontend Compilation Issues
```bash
# Clear node_modules and reinstall
cd client
rm -rf node_modules package-lock.json
npm install
npm start
```

#### 4. Backend API Issues
```bash
# Check backend logs
docker-compose logs backend

# Test API endpoints
curl http://localhost:5000/api/categories
curl http://localhost:5000/api/auth/register -X POST -H "Content-Type: application/json" -d '{"name":"Test","isAnonymous":true}'
```

### Error Messages and Solutions

#### "Route not found" for /api/
- **Cause**: No route defined for generic /api/ endpoint
- **Solution**: Use specific endpoints like /api/categories, /api/auth/login

#### "Validation failed" for anonymous registration
- **Cause**: Backend validation not handling null values
- **Solution**: Fixed in latest version with `{ nullable: true }` validation

#### Frontend shows translation keys instead of text
- **Cause**: Missing translation keys in LanguageContext
- **Solution**: All translation keys have been added

#### Anonymous login not redirecting
- **Cause**: Authentication state not updating properly
- **Solution**: Check browser console for debugging messages

## 🔧 Development

### Adding New Features

#### 1. Backend API
```bash
# Add new route
cd server/routes
# Create new route file or add to existing

# Add new model
cd server/models
# Create new model file

# Update database
# Add migration or update existing models
```

#### 2. Frontend Components
```bash
# Add new component
cd client/src/components
# Create new component file

# Add new page
cd client/src/pages
# Create new page component

# Update routing
# Edit client/src/App.js
```

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=janata_report
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your-secret-key
GOOGLE_MAPS_API_KEY=your-google-maps-key
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

### Database Schema

#### Users Table
- `id` (UUID, Primary Key)
- `name` (String, Required)
- `email` (String, Optional, Unique)
- `phone` (String, Optional, Unique)
- `password` (String, Optional for anonymous users)
- `isAnonymous` (Boolean, Default: false)
- `role` (Enum: citizen, official, admin)
- `isActive` (Boolean, Default: true)

#### Issues Table
- `id` (UUID, Primary Key)
- `issueId` (String, Unique identifier)
- `title` (String, Required)
- `description` (Text, Required)
- `status` (Enum: pending, in_progress, resolved, closed)
- `priority` (Enum: low, medium, high, critical)
- `location` (PostGIS Point, Required)
- `media` (JSON Array, Optional)
- `isAnonymous` (Boolean, Default: false)
- `upvotes` (Integer, Default: 0)

## 📞 Support

If you encounter any issues:

1. **Check the logs**: `docker-compose logs [service-name]`
2. **Verify prerequisites**: Ensure all required software is installed
3. **Check ports**: Ensure ports 3000, 5000, 5432 are available
4. **Database connection**: Verify PostgreSQL is running and accessible
5. **Environment variables**: Check all required environment variables are set

## 🎉 Success!

Once everything is running, you should see:
- Frontend at http://localhost:3000
- Backend API responding at http://localhost:5000
- Database running on port 5432
- All services healthy in Docker Desktop

**Happy coding! 🚀**