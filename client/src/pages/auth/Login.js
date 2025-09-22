import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, Phone, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import GoogleLogin from '../../components/GoogleLogin';
import toast from 'react-hot-toast';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { login, isAuthenticated, user, token, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset
  } = useForm();

  useEffect(() => {
    console.log('Login useEffect - isAuthenticated:', isAuthenticated);
    console.log('Login useEffect - user from context:', user);
    console.log('Login useEffect - token from context:', token);
    console.log('Login useEffect - loading from context:', loading);
    
    if (isAuthenticated && user) {
      console.log('User is authenticated, navigating to:', from);
      console.log('About to navigate to:', from);
      console.log('Current location before navigation:', window.location.pathname);
      
      // Force navigation
      setTimeout(() => {
        console.log('Forcing navigation after timeout...');
        navigate(from, { replace: true });
        console.log('Navigate function called');
      }, 100);
    }
  }, [isAuthenticated, navigate, from, user, token, loading]);

  const onSubmit = async (data) => {
    try {
      let credentials;
      
      if (isAnonymous) {
        credentials = {
          name: data.name,
          isAnonymous: true
        };
      } else {
        credentials = {
          [loginMethod]: data[loginMethod],
          password: data.password
        };
      }

      console.log('Login credentials:', credentials);
      const result = await login(credentials);
      console.log('Login result:', result);
      
      if (result.success) {
        toast.success('Login successful!');
        console.log('Login successful, attempting navigation...');
        console.log('Navigating to:', from);
        console.log('Login result data:', result);
        
        // Wait a moment for state to update, then navigate
        setTimeout(() => {
          console.log('Attempting React Router navigation...');
          try {
            navigate(from, { replace: true });
            console.log('React Router navigation called');
          } catch (navError) {
            console.error('React Router navigation error:', navError);
            // Fallback to window.location if React Router fails
            console.log('Falling back to window.location.href');
            window.location.href = from;
          }
        }, 200);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const switchLoginMethod = () => {
    setLoginMethod(loginMethod === 'email' ? 'phone' : 'email');
    reset();
  };

  const handleGoogleSuccess = async (response) => {
    try {
      console.log('Google login response:', response);
      
      // Send Google token to backend for verification
      const result = await login({
        googleToken: response.tokenId,
        provider: 'google'
      });

      if (result.success) {
        toast.success('Successfully logged in with Google!');
        // Navigation will be handled by useEffect
      } else {
        toast.error(result.error || 'Google login failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed. Please try again.');
    }
  };

  const handleGoogleFailure = (error) => {
    console.error('Google login failed:', error);
    toast.error('Google login failed. Please try again.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">JR</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('auth.login')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Login Method Toggle */}
            <div className="flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-l-md border ${
                  loginMethod === 'email'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('phone')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                  loginMethod === 'phone'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Phone className="w-4 h-4 inline mr-2" />
                Phone
              </button>
            </div>

            {/* Anonymous Login Toggle */}
            <div className="flex items-center">
              <input
                id="anonymous"
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => {
                  setIsAnonymous(e.target.checked);
                  if (e.target.checked) {
                    setLoginMethod('email'); // Reset to email when switching to anonymous
                  }
                }}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-900">
                {t('auth.login_as_anonymous')}
              </label>
            </div>

            {/* Name Input (for anonymous login) */}
            {isAnonymous && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  {t('auth.name')} <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('name', {
                      required: 'Name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters'
                      }
                    })}
                    type="text"
                    className={`input pl-10 ${errors.name ? 'border-red-300' : ''}`}
                    placeholder="Enter your name"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
            )}

            {/* Email/Phone Input (only if not anonymous) */}
            {!isAnonymous && (
              <div>
                <label htmlFor={loginMethod} className="block text-sm font-medium text-gray-700">
                  {loginMethod === 'email' ? t('auth.email') : t('auth.phone')}
                </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {loginMethod === 'email' ? (
                    <Mail className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Phone className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  {...register(loginMethod, {
                    required: `${loginMethod === 'email' ? 'Email' : 'Phone'} is required`,
                    pattern: loginMethod === 'email' 
                      ? {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      : {
                          value: /^[6-9]\d{9}$/,
                          message: 'Invalid phone number'
                        }
                  })}
                  type={loginMethod === 'email' ? 'email' : 'tel'}
                  className={`input pl-10 ${errors[loginMethod] ? 'border-red-300' : ''}`}
                  placeholder={loginMethod === 'email' ? 'Enter your email' : 'Enter your phone number'}
                />
              </div>
              {errors[loginMethod] && (
                <p className="mt-1 text-sm text-red-600">{errors[loginMethod].message}</p>
              )}
              </div>
            )}

            {/* Password Input (only if not anonymous) */}
            {!isAnonymous && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('auth.password')}
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className={`input pl-10 pr-10 ${errors.password ? 'border-red-300' : ''}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <button type="button" className="font-medium text-primary-600 hover:text-primary-500">
                {t('auth.forgot_password')}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                t('auth.login')
              )}
            </button>
          </div>

          {/* Google Login Section - Only show if Google is configured */}
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onFailure={handleGoogleFailure}
            buttonText="Continue with Google"
          />

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {t('auth.dont_have_account')}{' '}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                {t('auth.register')}
              </Link>
            </p>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default Login;
