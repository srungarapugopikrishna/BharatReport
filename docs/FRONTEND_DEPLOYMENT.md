# Frontend Deployment Guide

This guide covers multiple deployment options for the React frontend of the Bharat Report application.

## Prerequisites

1. **Environment Variables**: You'll need to set up the following environment variables:
   - `REACT_APP_API_URL`: Your backend API URL (already set to `https://bharatreport.onrender.com/api`)
   - `REACT_APP_GOOGLE_CLIENT_ID`: Your Google OAuth client ID

2. **Build the project**: The frontend needs to be built for production deployment.

## Option 1: Render.com (Recommended)

Since your backend is already on Render, this is the most convenient option.

### Steps:

1. **Create a new Static Site on Render:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Static Site"
   - Connect your GitHub repository

2. **Configure the build:**
   - **Root Directory**: `client` (IMPORTANT: Set this first)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Node Version**: 18 (or leave blank to use the .nvmrc file in client directory)

3. **Set Environment Variables:**
   - `REACT_APP_API_URL`: `https://bharatreport.onrender.com/api`
   - `REACT_APP_GOOGLE_CLIENT_ID`: Your Google OAuth client ID

4. **Deploy:**
   - Click "Create Static Site"
   - Render will automatically build and deploy your frontend

## Option 2: Vercel

### Steps:

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy from the project root:**
   ```bash
   vercel
   ```

3. **Configure in Vercel Dashboard:**
   - Set **Root Directory** to `client`
   - Set **Build Command** to `npm run build`
   - Set **Output Directory** to `build`

4. **Add Environment Variables:**
   - `REACT_APP_API_URL`: `https://bharatreport.onrender.com/api`
   - `REACT_APP_GOOGLE_CLIENT_ID`: Your Google OAuth client ID

## Option 3: Netlify

### Steps:

1. **Build the project locally:**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [Netlify](https://netlify.com)
   - Drag and drop the `client/build` folder
   - Or connect your GitHub repository

3. **Configure build settings:**
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/build`

4. **Add Environment Variables:**
   - Go to Site settings → Environment variables
   - Add `REACT_APP_API_URL` and `REACT_APP_GOOGLE_CLIENT_ID`

## Option 4: Docker Deployment

### Using the existing Dockerfile:

1. **Build the Docker image:**
   ```bash
   docker build -f config/Dockerfile.frontend -t bharat-report-frontend .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:3000 -e REACT_APP_API_URL=https://bharatreport.onrender.com/api -e REACT_APP_GOOGLE_CLIENT_ID=your-client-id bharat-report-frontend
   ```

### For production with nginx:

1. **Create a production Dockerfile:**
   ```dockerfile
   # Build stage
   FROM node:18-alpine as build
   WORKDIR /app
   COPY client/package*.json ./
   RUN npm install
   COPY client/ .
   RUN npm run build

   # Production stage
   FROM nginx:alpine
   COPY --from=build /app/build /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Build and run:**
   ```bash
   docker build -f Dockerfile.prod -t bharat-report-frontend-prod .
   docker run -p 80:80 bharat-report-frontend-prod
   ```

## Environment Variables Setup

### Required Environment Variables:

```bash
# API Configuration
REACT_APP_API_URL=https://bharatreport.onrender.com/api

# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here
```

### Getting Google OAuth Client ID:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set authorized origins to your frontend domain
6. Copy the Client ID

## Build Process

The frontend uses Create React App, so the build process is:

```bash
cd client
npm install
npm run build
```

This creates a `build` folder with optimized production files.

## Post-Deployment Checklist

1. ✅ Frontend is accessible via HTTPS
2. ✅ API calls are working (check browser network tab)
3. ✅ Google OAuth is working
4. ✅ All pages load correctly
5. ✅ Maps are loading (Google Maps/Mapbox)
6. ✅ File uploads are working
7. ✅ Responsive design works on mobile

## Troubleshooting

### Common Issues:

1. **"Could not find a required file. Name: index.html"**: 
   - Make sure Root Directory is set to `client`
   - Ensure there's a `.nvmrc` file in the client directory
   - Check that the build command doesn't include `cd client`

2. **CORS Errors**: Make sure your backend allows your frontend domain
3. **API 404**: Check that `REACT_APP_API_URL` is correct
4. **Google OAuth not working**: Verify client ID and authorized domains
5. **Maps not loading**: Check API keys and domain restrictions

### Debug Steps:

1. Check browser console for errors
2. Verify environment variables in build
3. Test API endpoints directly
4. Check network requests in browser dev tools

## Recommended: Render.com

For your setup, I recommend **Render.com** because:
- Your backend is already there
- Easy environment variable management
- Automatic deployments from Git
- Free tier available
- Good performance
- Simple configuration

Would you like me to help you set up any specific deployment option?
