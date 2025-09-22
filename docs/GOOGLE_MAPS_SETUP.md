# Google Maps Integration Setup

This guide will help you set up Google Maps integration for precise location selection in the JanataReport application.

## Features

- **Interactive Google Maps** - Real map with zoom, pan, and click functionality
- **Precise Location Selection** - Click anywhere to select exact coordinates
- **Automatic Address Resolution** - Converts coordinates to full addresses
- **Pincode Detection** - Automatically extracts pincode from selected location
- **District/State Detection** - Gets administrative area information

## Setup Instructions

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Create a new project or select existing one
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Geocoding API**
   - **Places API** (optional, for enhanced features)

### 2. Create API Key

1. Go to "Credentials" in the Google Cloud Console
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key
4. (Optional) Restrict the API key to your domain for security

### 3. Configure Environment Variables

1. Create a `.env` file in the `client` directory:
   ```bash
   cd client
   touch .env
   ```

2. Add your API key to the `.env` file:
   ```env
   REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

### 4. Restart the Application

```bash
docker-compose restart frontend
```

## Usage

1. **Report an Issue** - Go to the "Report Issue" page
2. **Select Location** - Click "Pick Location on Map"
3. **Interactive Map** - Zoom in/out, pan around to find your location
4. **Click to Select** - Click anywhere on the map to place a marker
5. **Confirm Location** - Click "Confirm" to get the full address
6. **Automatic Details** - Gets pincode, district, state, and full address

## Fallback Behavior

If no Google Maps API key is provided, the application will show:
- Instructions for setting up Google Maps
- Alternative location selection methods (pincode, manual entry, GPS)
- No functionality is lost

## Location Selection Options

1. **🗺️ Google Maps (Recommended)** - Most accurate and user-friendly
2. **📮 Pincode** - India-specific, very accurate for Indian addresses
3. **📍 Manual Entry** - Type any location manually
4. **🌍 GPS Detection** - Use current location with permission

## Technical Details

- **Map Library**: Google Maps JavaScript API
- **Geocoding**: Google Geocoding API for address resolution
- **Coordinate Precision**: 6 decimal places (sub-meter accuracy)
- **Address Components**: Street, locality, district, state, pincode, country
- **Error Handling**: Graceful fallbacks if APIs fail

## Troubleshooting

### Map Not Loading
- Check if API key is correctly set in `.env` file
- Verify that Maps JavaScript API is enabled
- Check browser console for error messages

### Address Not Found
- Ensure Geocoding API is enabled
- Check if the selected location has valid address data
- Application will fallback to coordinates if geocoding fails

### API Quota Exceeded
- Check your Google Cloud Console for usage limits
- Consider setting up billing if using free tier
- Monitor API usage in the console

## Security Notes

- Never commit your API key to version control
- Add `.env` to your `.gitignore` file
- Consider restricting your API key to specific domains
- Monitor API usage regularly

## Cost Considerations

- Google Maps API has usage-based pricing
- Free tier includes $200 monthly credit
- Typical usage: ~$0.007 per map load, ~$0.005 per geocoding request
- Monitor usage in Google Cloud Console

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify API key configuration
3. Ensure all required APIs are enabled
4. Check Google Cloud Console for quota/usage issues
