import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      console.log('AuthContext: Starting authentication initialization...');
      // Get token from localStorage on every page load
      const storedToken = localStorage.getItem('token');
      console.log('AuthContext initAuth - storedToken:', storedToken ? 'Token exists' : 'No token');
      
      if (storedToken) {
        setToken(storedToken);
        try {
          console.log('AuthContext: Fetching current user with token...');
          const userData = await authAPI.getCurrentUser();
          console.log('AuthContext: Current user data received:', userData);
          setUser(userData.data.user);
          console.log('AuthContext: User set successfully:', userData.data.user);
        } catch (error) {
          console.error('AuthContext: Authentication initialization error:', error);
          console.error('AuthContext: Error details:', error.response?.data);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } else {
        console.log('AuthContext: No token found, user not authenticated');
        setUser(null);
        setToken(null);
      }
      setLoading(false);
      console.log('AuthContext: Authentication initialization complete');
    };

    initAuth();
  }, []); // Empty dependency array to run on every mount

  const login = async (credentials) => {
    try {
      console.log('AuthContext login called with:', credentials);
      
      // Handle Google OAuth login
      if (credentials.provider === 'google' && credentials.googleToken) {
        const response = await authAPI.googleLogin(credentials.googleToken);
        console.log('AuthContext Google login response:', response);
        console.log('AuthContext Google login response data:', response.data);
        
        const { token: newToken, user: userData } = response.data;
        
        if (!newToken || !userData) {
          console.error('Missing token or user data in Google login response:', response.data);
          return { 
            success: false, 
            error: 'Invalid response from server' 
          };
        }
        
        console.log('Setting token and user in AuthContext for Google login...');
        localStorage.setItem('token', newToken);
        
        // Update state synchronously
        setToken(newToken);
        setUser(userData);
        
        console.log('AuthContext user set to:', userData);
        console.log('AuthContext token set to:', newToken);
        console.log('AuthContext isAuthenticated will be:', !!userData);
        
        // Force a re-render by updating state again
        setTimeout(() => {
          setUser(userData);
          setToken(newToken);
          console.log('AuthContext state updated again for Google login');
        }, 50);
        
        return { success: true, user: userData, token: newToken };
      }
      
      // Handle regular login
      const response = await authAPI.login(credentials);
      console.log('AuthContext login response:', response);
      console.log('AuthContext login response data:', response.data);
      
      const { token: newToken, user: userData } = response.data;
      
      if (!newToken || !userData) {
        console.error('Missing token or user data in response:', response.data);
        return { 
          success: false, 
          error: 'Invalid response from server' 
        };
      }
      
      console.log('Setting token and user in AuthContext...');
      localStorage.setItem('token', newToken);
      
      // Update state synchronously
      setToken(newToken);
      setUser(userData);
      
      console.log('AuthContext user set to:', userData);
      console.log('AuthContext token set to:', newToken);
      console.log('AuthContext isAuthenticated will be:', !!userData);
      
      // Force a re-render by updating state again
      setTimeout(() => {
        setUser(userData);
        setToken(newToken);
        console.log('AuthContext state updated again');
      }, 50);
      
      return { success: true, user: userData, token: newToken };
    } catch (error) {
      console.error('AuthContext login error:', error);
      console.error('AuthContext login error response:', error.response);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      // Handle Google OAuth registration
      if (userData.provider === 'google' && userData.googleToken) {
        const response = await authAPI.googleLogin(userData.googleToken);
        console.log('AuthContext Google registration response:', response);
        console.log('AuthContext Google registration response data:', response.data);
        
        const { token: newToken, user: newUser } = response.data;
        
        if (!newToken || !newUser) {
          console.error('Missing token or user data in Google registration response:', response.data);
          return { 
            success: false, 
            error: 'Invalid response from server' 
          };
        }
        
        console.log('Setting token and user in AuthContext for Google registration...');
        localStorage.setItem('token', newToken);
        
        // Update state synchronously
        setToken(newToken);
        setUser(newUser);
        
        console.log('AuthContext user set to:', newUser);
        console.log('AuthContext token set to:', newToken);
        console.log('AuthContext isAuthenticated will be:', !!newUser);
        
        // Force a re-render by updating state again
        setTimeout(() => {
          setUser(newUser);
          setToken(newToken);
          console.log('AuthContext state updated again for Google registration');
        }, 50);
        
        return { success: true, user: newUser, token: newToken };
      }
      
      // Handle regular registration
      const response = await authAPI.register(userData);
      const { token: newToken, user: newUser } = response;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      setUser(response.user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Profile update failed' 
      };
    }
  };

  const isAuthenticated = !!user;
  
  console.log('AuthContext render - user:', user, 'isAuthenticated:', isAuthenticated);
  console.log('AuthContext render - token:', token);
  console.log('AuthContext render - loading:', loading);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    isOfficial: user?.role === 'official'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
