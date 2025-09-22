import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Users, Settings, BarChart3, FileText, Plus, Eye } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import CategoriesManagement from '../admin/CategoriesManagement';
import OfficialsManagement from '../admin/OfficialsManagement';
import AuthorityManagement from '../admin/AuthorityManagement';
import UsersManagement from '../admin/UsersManagement';
import AdminDashboard from '../admin/AdminDashboard';

const AdminPanel = () => {
  const { t } = useLanguage();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Categories', href: '/admin/categories', icon: FileText },
    { name: 'Officials', href: '/admin/officials', icon: Users },
    { name: 'Authorities', href: '/admin/authorities', icon: Users },
    { name: 'Users', href: '/admin/users', icon: Users },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-2">
            Manage categories, officials, and platform settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(item.href)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/categories" element={<CategoriesManagement />} />
              <Route path="/officials" element={<OfficialsManagement />} />
              <Route path="/authorities" element={<AuthorityManagement />} />
              <Route path="/users" element={<UsersManagement />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
