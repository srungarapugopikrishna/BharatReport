# JanataReport - Quick Start Guide

## 🚀 One-Command Setup

```bash
# Clone, navigate, and start everything
git clone <your-repo-url> && cd JantaReport && docker-compose up --build
```

## 📋 Essential Commands

### Docker Commands
```bash
# Start all services
docker-compose up --build

# Start in background
docker-compose up --build -d

# Stop all services
docker-compose down

# View logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs postgres

# Restart specific service
docker-compose restart frontend
docker-compose restart backend
```

### Database Commands
```bash
# Seed initial data
docker-compose exec backend node scripts/seed.js

# Access database
docker-compose exec postgres psql -U postgres -d janata_report
```

### Development Commands
```bash
# Frontend development
cd client && npm start

# Backend development
cd server && npm start

# Install dependencies
cd client && npm install
cd server && npm install
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: localhost:5432

## 🧪 Test the Application

### 1. Anonymous User Test
1. Go to http://localhost:3000/register
2. Check "Register as Anonymous"
3. Enter name: "TestUser"
4. Submit registration
5. Login with same name

### 2. Regular User Test
1. Go to http://localhost:3000/register
2. Fill in email, phone, password
3. Submit registration
4. Login with credentials

### 3. API Test
```bash
# Test categories endpoint
curl http://localhost:5000/api/categories

# Test anonymous registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"TestUser","isAnonymous":true}'

# Test anonymous login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"TestUser","isAnonymous":true}'
```

## 🐛 Quick Fixes

### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Kill process (Windows)
taskkill /PID <PID_NUMBER> /F
```

### Container Issues
```bash
# Clean restart
docker-compose down
docker-compose up --build

# Remove all containers and volumes
docker-compose down -v
docker system prune -a
```

### Database Issues
```bash
# Reset database
docker-compose down -v
docker-compose up --build
docker-compose exec backend node scripts/seed.js
```

## 📱 Features to Test

1. **Registration**: Both anonymous and regular users
2. **Login**: Both anonymous and regular users
3. **Language Switching**: English, Hindi, Telugu
4. **Issue Reporting**: Create new issues with location
5. **Dashboard**: View analytics and statistics
6. **Admin Panel**: Manage categories and users (admin role)

## 🔧 Environment Setup

### Required Software
- Docker Desktop
- Git

### Optional (for development)
- Node.js (v16+)
- PostgreSQL with PostGIS
- Python (v3.8+)

## 📞 Need Help?

1. Check `SETUP_GUIDE.md` for detailed instructions
2. Check Docker logs: `docker-compose logs [service]`
3. Verify all services are running: `docker-compose ps`
4. Test API endpoints with curl commands above

**That's it! You're ready to go! 🎉**
