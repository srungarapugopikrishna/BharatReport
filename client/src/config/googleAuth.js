// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id';

// Google OAuth scopes
export const GOOGLE_SCOPES = [
  'openid',
  'profile',
  'email'
];

// Google OAuth configuration for react-google-login
export const GOOGLE_CONFIG = {
  clientId: GOOGLE_CLIENT_ID,
  scope: GOOGLE_SCOPES.join(' '),
  redirectUri: window.location.origin,
  responseType: 'code',
  accessType: 'offline',
  prompt: 'consent'
};
