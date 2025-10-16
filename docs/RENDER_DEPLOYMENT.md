# Render Deployment Guide

## Overview
This guide explains how to deploy the JanataReport application to Render.

## Services Configuration

The application consists of two services:

### 1. Backend Service (janata-backend)
- **Type**: Web Service
- **Environment**: Node.js
- **Build Command**: `cd server && npm install`
- **Start Command**: `cd server && npm start`
- **Port**: 5000

### 2. Frontend Service (janata-frontend)
- **Type**: Static Site
- **Environment**: Static
- **Build Command**: `cd client && npm install && npm run build`
- **Static Publish Path**: `./client/build`

## Environment Variables

### Backend Environment Variables
- `NODE_ENV`: production
- `JWT_SECRET`: (auto-generated)
- `PORT`: 5000
- `DB_HOST`: Your PostgreSQL host
- `DB_PORT`: 5432
- `DB_NAME`: janata_report
- `DB_USER`: Your database username
- `DB_PASSWORD`: Your database password
- `DATABASE_URL`: Complete PostgreSQL connection string
- `DB_SSL`: "true"

### Frontend Environment Variables
- `REACT_APP_API_URL`: https://your-backend-service.onrender.com/api
- `REACT_APP_GOOGLE_MAPS_API_KEY`: Your Google Maps API key

## Deployment Steps

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Fix deployment configuration"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure Backend Service**
   - Name: `janata-backend`
   - Environment: `Node`
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   - Add all required environment variables

4. **Configure Frontend Service**
   - Name: `janata-frontend`
   - Environment: `Static Site`
   - Build Command: `cd client && npm install && npm run build`
   - Publish Directory: `client/build`
   - Add environment variables

5. **Update API URL**
   - After backend deploys, update `REACT_APP_API_URL` in frontend service
   - Use the backend service URL: `https://janata-backend.onrender.com/api`

## Troubleshooting

### Common Issues

1. **Build Fails with "Could not find index.html"**
   - Ensure you're using the correct build command
   - Check that the static publish path is set to `./client/build`

2. **Node.js Version Warnings**
   - Update `.nvmrc` files to use Node.js 20
   - Update `package.json` engines field

3. **Security Vulnerabilities**
   - Run `npm audit fix` in both client and server directories
   - Some vulnerabilities may require manual review

4. **Database Connection Issues**
   - Ensure all database environment variables are set correctly
   - Check that the database is accessible from Render's IP ranges

### Manual Deployment Commands

If you need to deploy manually:

```bash
# Backend
cd server
npm install
npm start

# Frontend
cd client
npm install
npm run build
# Serve the build directory
```

## Monitoring

- Check Render dashboard for service status
- Monitor logs for any errors
- Set up health checks for both services

## Security Notes

- Never commit sensitive environment variables to Git
- Use Render's environment variable management
- Regularly update dependencies to fix security issues
- Enable SSL/TLS for production deployments
