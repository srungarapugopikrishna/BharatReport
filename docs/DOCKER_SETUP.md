# JanataReport Docker Setup Guide

This guide will help you run the JanataReport project using Docker, which is the easiest way to get everything running without installing Node.js, PostgreSQL, or other dependencies manually.

## Prerequisites

### 1. Install Docker Desktop
1. Go to https://www.docker.com/products/docker-desktop/
2. Download Docker Desktop for Windows
3. Install Docker Desktop
4. **Important:** Make sure Docker Desktop is running before proceeding

### 2. Verify Docker Installation
Open Command Prompt or PowerShell and run:
```bash
docker --version
docker-compose --version
```

## Quick Start (Easiest Method)

### Option 1: Using the Setup Script
1. **Double-click `docker-setup.bat`** or run in Command Prompt:
   ```bash
   docker-setup.bat
   ```

### Option 2: Manual Docker Commands
1. **Create environment files:**
   ```bash
   copy server\env.example server\.env
   echo REACT_APP_API_URL=http://localhost:5000/api > client\.env
   echo REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key >> client\.env
   ```

2. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Admin Login: admin@janatareport.com / admin123

## What Docker Does

Docker will automatically:
- ✅ Install Node.js (version 18)
- ✅ Install PostgreSQL with PostGIS extension
- ✅ Set up the database with sample data
- ✅ Install all frontend and backend dependencies
- ✅ Start both React frontend and Node.js backend
- ✅ Handle all networking between services

## Services Included

1. **PostgreSQL Database** (port 5432)
   - Database: janata_report
   - User: postgres
   - Password: janata123
   - Includes PostGIS extension for location features

2. **Backend API** (port 5000)
   - Node.js/Express server
   - All API endpoints
   - Database connections
   - Authentication

3. **Frontend React App** (port 3000)
   - React development server
   - Hot reloading
   - All UI components

## Useful Docker Commands

### Start the application:
```bash
docker-compose up
```

### Start in background (detached mode):
```bash
docker-compose up -d
```

### Stop the application:
```bash
docker-compose down
```

### View logs:
```bash
docker-compose logs
```

### Rebuild containers:
```bash
docker-compose up --build
```

### Access database directly:
```bash
docker exec -it janata-postgres psql -U postgres -d janata_report
```

### Access backend container:
```bash
docker exec -it janata-backend sh
```

### Access frontend container:
```bash
docker exec -it janata-frontend sh
```

## Troubleshooting

### Common Issues:

1. **"Docker is not running"**
   - Make sure Docker Desktop is started
   - Look for Docker icon in system tray

2. **Port already in use**
   - Stop other applications using ports 3000 or 5000
   - Or change ports in docker-compose.yml

3. **Database connection failed**
   - Wait a few seconds for PostgreSQL to start
   - Check if postgres container is running: `docker ps`

4. **Build failed**
   - Clear Docker cache: `docker system prune -a`
   - Rebuild: `docker-compose up --build --force-recreate`

### Reset Everything:
```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

## Development

### Making Changes:
- **Frontend changes** - Edit files in `client/src/` (auto-reloads)
- **Backend changes** - Edit files in `server/` (auto-reloads)
- **Database changes** - Modify models in `server/models/`

### Adding Dependencies:
1. Edit `package.json` files
2. Rebuild containers: `docker-compose up --build`

## Production Deployment

For production, you would:
1. Use production Docker images
2. Set up proper environment variables
3. Use external database
4. Set up reverse proxy (nginx)
5. Use Docker Swarm or Kubernetes

## Advantages of Docker Setup

✅ **No manual installation** of Node.js, PostgreSQL, or Python
✅ **Consistent environment** across different machines
✅ **Easy to share** with team members
✅ **Isolated dependencies** - won't affect your system
✅ **Easy to reset** if something goes wrong
✅ **Production-ready** setup

---

**This is the recommended approach for getting started quickly!** 🚀
