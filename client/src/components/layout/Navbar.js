import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings, BarChart3, Home, FileText, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };

  const NavLink = ({ to, children, icon: Icon, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive(to)
          ? 'bg-primary-100 text-primary-700'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </Link>
  );

  const LanguageSelector = () => (
    <div className="relative">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
        <option value="te">తెలుగు</option>
      </select>
    </div>
  );

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">JR</span>
                </div>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">
                JanataReport
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/">
              <Home className="w-4 h-4 mr-2" />
              {t('nav.home')}
            </NavLink>
            
            <NavLink to="/issues">
              <FileText className="w-4 h-4 mr-2" />
              {t('nav.issues')}
            </NavLink>
            
            <NavLink to="/analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              {t('nav.analytics')}
            </NavLink>

            {isAuthenticated && (
              <>
                <NavLink to="/dashboard">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {t('nav.dashboard')}
                </NavLink>
                <NavLink to="/report">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('nav.report')}
                </NavLink>
              </>
            )}

            <LanguageSelector />

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  <span className="ml-2 text-gray-700">{user?.name}</span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <NavLink to="/profile" onClick={() => setIsProfileOpen(false)}>
                      <Settings className="w-4 h-4 mr-2" />
                      {t('nav.profile')}
                    </NavLink>
                    {user?.role === 'admin' && (
                      <NavLink to="/admin" onClick={() => setIsProfileOpen(false)}>
                        <Settings className="w-4 h-4 mr-2" />
                        {t('nav.admin')}
                      </NavLink>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <LanguageSelector />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            <NavLink to="/" onClick={() => setIsOpen(false)}>
              <Home className="w-4 h-4 mr-2" />
              {t('nav.home')}
            </NavLink>
            
            <NavLink to="/issues" onClick={() => setIsOpen(false)}>
              <FileText className="w-4 h-4 mr-2" />
              {t('nav.issues')}
            </NavLink>
            
            <NavLink to="/analytics" onClick={() => setIsOpen(false)}>
              <BarChart3 className="w-4 h-4 mr-2" />
              {t('nav.analytics')}
            </NavLink>

            {isAuthenticated && (
              <>
                <NavLink to="/dashboard" onClick={() => setIsOpen(false)}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {t('nav.dashboard')}
                </NavLink>
                <NavLink to="/report" onClick={() => setIsOpen(false)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('nav.report')}
                </NavLink>
                <NavLink to="/profile" onClick={() => setIsOpen(false)}>
                  <Settings className="w-4 h-4 mr-2" />
                  {t('nav.profile')}
                </NavLink>
                {user?.role === 'admin' && (
                  <NavLink to="/admin" onClick={() => setIsOpen(false)}>
                    <Settings className="w-4 h-4 mr-2" />
                    {t('nav.admin')}
                  </NavLink>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('nav.logout')}
                </button>
              </>
            )}

            {!isAuthenticated && (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      {t('common.guest')}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  >
                    {t('nav.register')}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
