import React, { useEffect, useRef } from 'react';
import { GOOGLE_CONFIG } from '../config/googleAuth';
import toast from 'react-hot-toast';

const GoogleLogin = ({ onSuccess, onFailure, buttonText = "Continue with Google", className = "" }) => {
  const googleButtonRef = useRef(null);

  // Check if Google Client ID is configured
  const isGoogleConfigured = GOOGLE_CONFIG.clientId && 
    GOOGLE_CONFIG.clientId !== 'your-google-client-id' && 
    GOOGLE_CONFIG.clientId !== '';

  useEffect(() => {
    // Only load Google services if Client ID is configured
    if (!isGoogleConfigured) {
      console.log('Google OAuth not configured - Client ID not provided');
      return;
    }

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CONFIG.clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        // Render the button
        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            shape: 'rectangular'
          });
        }
      }
    };

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [isGoogleConfigured]);

  const handleCredentialResponse = (response) => {
    console.log('Google login success:', response);
    toast.success('Google login successful!');
    
    if (onSuccess) {
      onSuccess({
        tokenId: response.credential,
        credential: response.credential
      });
    }
  };

  const handleClick = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      console.error('Google Identity Services not loaded');
      toast.error('Google login not available. Please try again.');
      if (onFailure) {
        onFailure(new Error('Google Identity Services not loaded'));
      }
    }
  };

  // Don't render anything if Google is not configured
  if (!isGoogleConfigured) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      <div ref={googleButtonRef} className="w-full"></div>
    </div>
  );
};

export default GoogleLogin;
