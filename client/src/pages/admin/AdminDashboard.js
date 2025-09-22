import React from 'react';
import { useQuery } from 'react-query';
import { Users, FileText, CheckCircle, Clock, TrendingUp, AlertCircle, Plus, Eye } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { analyticsAPI, issuesAPI, categoriesAPI, officialsAPI } from '../../services/api';

const AdminDashboard = () => {
  const { t } = useLanguage();
  
  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery(
    'adminAnalytics',
    () => analyticsAPI.getDashboard(),
    {
      select: (response) => response.data
    }
  );

  // Fetch recent issues
  const { data: recentIssues, isLoading: issuesLoading } = useQuery(
    'adminRecentIssues',
    () => issuesAPI.getIssues({ limit: 5, sortBy: 'createdAt', sortOrder: 'DESC' }),
    {
      select: (response) => response.data.issues
    }
  );

  // Fetch categories count
  const { data: categoriesData } = useQuery(
    'adminCategories',
    () => categoriesAPI.getCategories(),
    {
      select: (response) => response.data
    }
  );

  // Fetch officials count
  const { data: officialsData } = useQuery(
    'adminOfficials',
    () => officialsAPI.getOfficials({ limit: 1 }),
    {
      select: (response) => response.data.pagination.total
    }
  );

  if (analyticsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="card animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
          <div className="card animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Issues</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analyticsData?.overview?.totalIssues?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Resolved Issues</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analyticsData?.overview?.issuesByStatus?.resolved || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Officials</p>
              <p className="text-2xl font-semibold text-gray-900">
                {officialsData || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Resolution Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analyticsData?.overview?.resolutionRate || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues by Status */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues by Status</h3>
          <div className="space-y-3">
            {analyticsData?.overview?.issuesByStatus && Object.entries(analyticsData.overview.issuesByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    status === 'resolved' ? 'bg-green-500' :
                    status === 'in_progress' ? 'bg-blue-500' :
                    status === 'open' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {status.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Issues */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Issues</h3>
          {issuesLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {recentIssues?.map((issue) => (
                <div key={issue.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                      {issue.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {issue.Category?.name} • {new Date(issue.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      issue.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      issue.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {t(`status.${issue.status}`)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Plus className="w-5 h-5 text-primary-600 mr-3" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Add Category</p>
              <p className="text-xs text-gray-500">Create new issue category</p>
            </div>
          </button>
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="w-5 h-5 text-primary-600 mr-3" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Add Official</p>
              <p className="text-xs text-gray-500">Register new official</p>
            </div>
          </button>
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Eye className="w-5 h-5 text-primary-600 mr-3" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">View All Issues</p>
              <p className="text-xs text-gray-500">Browse all reported issues</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
