# JanataReport - Troubleshooting Guide

## 🚨 Common Issues and Solutions

### 1. Frontend Compilation Errors

#### Issue: "Cannot find module '../contexts/LanguageContext'"
**Error**: `Module not found: Error: Can't resolve '../contexts/LanguageContext'`

**Solution**: 
```bash
# The LanguageContext.js file was missing
# This has been fixed in the latest version
# If you still see this error, restart the frontend:
docker-compose restart frontend
```

#### Issue: "Parsing error: Unexpected token, expected ','"
**Error**: Syntax error in Login.js

**Solution**:
```bash
# This was caused by incorrect conditional structure
# Fixed in latest version - restart frontend:
docker-compose restart frontend
```

#### Issue: Translation keys showing instead of text
**Error**: See "home.title", "auth.email" instead of actual text

**Solution**:
```bash
# Missing translation keys in LanguageContext
# Fixed in latest version - restart frontend:
docker-compose restart frontend
```

### 2. Backend API Errors

#### Issue: "Route not found" for /api/
**Error**: `{"error":"Route not found"}` when accessing http://localhost:5000/api/

**Solution**:
- This is expected behavior - there's no generic /api/ route
- Use specific endpoints:
  - `http://localhost:5000/api/categories`
  - `http://localhost:5000/api/auth/login`
  - `http://localhost:5000/api/issues`

#### Issue: "Validation failed" for anonymous registration
**Error**: Anonymous user registration fails with validation error

**Solution**:
```bash
# Backend validation was not handling null values
# Fixed in latest version - restart backend:
docker-compose restart backend
```

#### Issue: SQL errors in analytics
**Error**: `invalid reference to FROM-clause entry for table "Issues"`

**Solution**:
```bash
# SQL query syntax errors in analytics routes
# Fixed in latest version - restart backend:
docker-compose restart backend
```

### 3. Authentication Issues

#### Issue: Anonymous login not redirecting
**Error**: User stays on login page after successful anonymous login

**Solution**:
```bash
# Check browser console for debugging messages
# Look for:
# - "AuthContext login called with: {name: 'TestA', isAnonymous: true}"
# - "AuthContext user set to: {id: '...', name: 'TestA', ...}"
# - "Login useEffect - isAuthenticated: true"

# If you don't see these messages, restart both services:
docker-compose restart backend frontend
```

#### Issue: Navbar shows login/register after authentication
**Error**: User is authenticated but navbar still shows login/register buttons

**Solution**:
```bash
# Authentication state not updating properly
# Check browser console for AuthContext debug messages
# Restart frontend if needed:
docker-compose restart frontend
```

### 4. Docker Issues

#### Issue: "Container name already in use"
**Error**: `Conflict. The container name "/janata-frontend" is already in use`

**Solution**:
```bash
# Stop and remove all containers
docker-compose down

# Remove specific container
docker rm janata-frontend

# Start fresh
docker-compose up --build
```

#### Issue: Port already in use
**Error**: Port 3000, 5000, or 5432 already in use

**Solution**:
```bash
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :5000
netstat -ano | findstr :5432

# Kill the process (Windows)
taskkill /PID <PID_NUMBER> /F

# Or change ports in docker-compose.yml
```

#### Issue: Database connection failed
**Error**: Backend can't connect to PostgreSQL

**Solution**:
```bash
# Check if postgres container is running
docker-compose ps

# Check postgres logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres

# If still failing, reset database
docker-compose down -v
docker-compose up --build
```

### 5. Database Issues

#### Issue: PostGIS extension not found
**Error**: `extension "postgis" does not exist`

**Solution**:
```bash
# PostGIS extension needs to be enabled
# Connect to database and run:
docker-compose exec postgres psql -U postgres -d janata_report -c "CREATE EXTENSION postgis;"
```

#### Issue: Database not seeded
**Error**: No categories or initial data

**Solution**:
```bash
# Run the seed script
docker-compose exec backend node scripts/seed.js

# Or manually seed
docker-compose exec backend npm run seed
```

### 6. Frontend Issues

#### Issue: Page not loading
**Error**: Blank page or "This site can't be reached"

**Solution**:
```bash
# Check if frontend container is running
docker-compose ps

# Check frontend logs
docker-compose logs frontend

# Restart frontend
docker-compose restart frontend

# If still failing, rebuild
docker-compose down
docker-compose up --build
```

#### Issue: API calls failing
**Error**: Network errors or CORS issues

**Solution**:
```bash
# Check if backend is running
docker-compose ps

# Check backend logs
docker-compose logs backend

# Test API directly
curl http://localhost:5000/api/categories

# Restart backend if needed
docker-compose restart backend
```

## 🔍 Debugging Steps

### 1. Check Service Status
```bash
# Check all containers
docker-compose ps

# Should show:
# - janata-frontend: Up
# - janata-backend: Up  
# - janata-postgres: Up
```

### 2. Check Logs
```bash
# Frontend logs
docker-compose logs frontend --tail=20

# Backend logs
docker-compose logs backend --tail=20

# Database logs
docker-compose logs postgres --tail=20
```

### 3. Test API Endpoints
```bash
# Test categories
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

### 4. Check Browser Console
1. Open http://localhost:3000
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Look for error messages or debug logs

### 5. Verify Environment Variables
```bash
# Check if .env file exists in server directory
ls server/.env

# Check environment variables
docker-compose exec backend env | grep DB_
```

## 🆘 Still Having Issues?

### Complete Reset
```bash
# Stop everything
docker-compose down

# Remove all containers and volumes
docker-compose down -v

# Remove all images
docker system prune -a

# Start fresh
docker-compose up --build

# Seed database
docker-compose exec backend node scripts/seed.js
```

### Manual Database Reset
```bash
# Connect to database
docker-compose exec postgres psql -U postgres

# Drop and recreate database
DROP DATABASE janata_report;
CREATE DATABASE janata_report;
\c janata_report;
CREATE EXTENSION postgis;
\q

# Restart backend to recreate tables
docker-compose restart backend
```

### Check System Resources
```bash
# Check Docker resources
docker system df

# Check available disk space
df -h

# Check available memory
free -h
```

## 📞 Getting Help

If you're still having issues:

1. **Check the logs** for specific error messages
2. **Verify all prerequisites** are installed correctly
3. **Try the complete reset** procedure above
4. **Check system resources** (disk space, memory)
5. **Test API endpoints** individually
6. **Check browser console** for frontend errors

**Most issues can be resolved by restarting the services or doing a complete reset! 🚀**
