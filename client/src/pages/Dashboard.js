import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Plus, Eye, TrendingUp, Clock, CheckCircle, AlertCircle, MapPin, Calendar, Share2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { issuesAPI, analyticsAPI } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  
  console.log('Dashboard component rendered for user:', user);

  // Fetch user's issues
  const { data: myIssues, isLoading: issuesLoading } = useQuery(
    'myIssues',
    () => issuesAPI.getMyIssues({ limit: 10 }),
    {
      select: (response) => response.data.issues
    }
  );

  // Fetch recent issues
  const { data: recentIssues, isLoading: recentLoading } = useQuery(
    'recentIssues',
    () => issuesAPI.getIssues({ limit: 6, sortBy: 'createdAt', sortOrder: 'DESC' }),
    {
      select: (response) => response.data.issues
    }
  );

  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery(
    'dashboardAnalytics',
    () => analyticsAPI.getDashboard(),
    {
      select: (response) => response.data
    }
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'open':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'my-issues', name: 'My Issues', icon: Eye },
    { id: 'recent', name: 'Recent Issues', icon: Clock }
  ];

  // Function to share issue
  const handleShare = async (issue) => {
    const shareData = {
      title: issue.title,
      text: issue.description,
      url: `${window.location.origin}/issues/${issue.id}`
    };

    try {
      // Check if Web Share API is supported
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Issue shared successfully!');
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Issue link copied to clipboard!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        // If Web Share API fails, try clipboard fallback
        try {
          await navigator.clipboard.writeText(shareData.url);
          toast.success('Issue link copied to clipboard!');
        } catch (clipboardError) {
          console.error('Failed to copy to clipboard:', clipboardError);
          toast.error('Failed to share issue. Please copy the URL manually.');
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with civic issues in your area.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/report"
              className="btn btn-primary flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Report New Issue
            </Link>
            <Link
              to="/issues"
              className="btn btn-secondary flex items-center justify-center"
            >
              <Eye className="w-5 h-5 mr-2" />
              Browse All Issues
            </Link>
            <Link
              to="/analytics"
              className="btn btn-secondary flex items-center justify-center"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              View Analytics
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {analyticsData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-primary-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Issues</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analyticsData.overview.totalIssues.toLocaleString()}
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
                  <p className="text-sm font-medium text-gray-500">Resolved</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analyticsData.overview.issuesByStatus.resolved || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analyticsData.overview.issuesByStatus.open || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Resolution Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analyticsData.overview.resolutionRate}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* My Recent Issues */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">My Recent Issues</h3>
                  <Link
                    to="/issues?filter=my-issues"
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    View all
                  </Link>
                </div>
                {issuesLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : myIssues?.length > 0 ? (
                  <div className="space-y-3">
                    {myIssues.slice(0, 5).map((issue) => (
                      <div key={issue.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {getStatusIcon(issue.status)}
                            <span className={`status-badge status-${issue.status}`}>
                              {t(`status.${issue.status}`)}
                            </span>
                          </div>
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                            {issue.title}
                          </h4>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {issue.Category?.name}
                          </p>
                        </div>
                        <Link
                          to={`/issues/${issue.id}`}
                          className="text-primary-600 hover:text-primary-700 text-sm"
                        >
                          View
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No issues reported yet</p>
                    <Link
                      to="/report"
                      className="btn btn-primary mt-4"
                    >
                      Report Your First Issue
                    </Link>
                  </div>
                )}
              </div>

              {/* Recent Community Issues */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Community Issues</h3>
                  <Link
                    to="/issues"
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    View all
                  </Link>
                </div>
                {recentLoading ? (
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
                    {recentIssues?.slice(0, 5).map((issue) => (
                      <div key={issue.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {getStatusIcon(issue.status)}
                            <span className={`status-badge status-${issue.status}`}>
                              {t(`status.${issue.status}`)}
                            </span>
                            <span className={`priority-badge ${getPriorityColor(issue.priority)}`}>
                              {t(`priority.${issue.priority}`)}
                            </span>
                          </div>
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                            {issue.title}
                          </h4>
                          <div className="flex items-center text-xs text-gray-500">
                            <MapPin className="w-3 h-3 mr-1" />
                            {issue.location?.address || 'Location not specified'}
                          </div>
                        </div>
                        <Link
                          to={`/issues/${issue.id}`}
                          className="text-primary-600 hover:text-primary-700 text-sm"
                        >
                          View
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'my-issues' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">My Issues</h3>
              {issuesLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="animate-pulse p-4 border rounded-lg">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : myIssues?.length > 0 ? (
                <div className="space-y-4">
                  {myIssues.map((issue) => (
                    <div key={issue.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(issue.status)}
                            <span className={`status-badge status-${issue.status}`}>
                              {t(`status.${issue.status}`)}
                            </span>
                            <span className={`priority-badge ${getPriorityColor(issue.priority)}`}>
                              {t(`priority.${issue.priority}`)}
                            </span>
                          </div>
                          <h4 className="text-lg font-medium text-gray-900 mb-2">
                            {issue.title}
                          </h4>
                          
                          {/* Images */}
                          {issue.media && issue.media.length > 0 && (
                            <div className="mb-3">
                              <div className="flex space-x-2">
                                {issue.media.slice(0, 2).map((image, index) => (
                                  <div key={index} className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    <img
                                      src={image}
                                      alt={`Issue image ${index + 1}`}
                                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                    {index === 1 && issue.media.length > 2 && (
                                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                        <span className="text-white text-xs font-medium">
                                          +{issue.media.length - 2}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {issue.description}
                          </p>
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="w-4 h-4 mr-1" />
                            {issue.location?.address || 'Location not specified'}
                            <span className="mx-2">•</span>
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleShare(issue)}
                            className="btn btn-secondary px-3"
                            title="Share this issue"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/issues/${issue.id}`}
                            className="btn btn-primary"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No issues reported yet</h3>
                  <p className="text-gray-500 mb-6">Start by reporting your first civic issue</p>
                  <Link
                    to="/report"
                    className="btn btn-primary"
                  >
                    Report an Issue
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'recent' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Community Issues</h3>
              {recentLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="animate-pulse p-4 border rounded-lg">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentIssues?.map((issue) => (
                    <div key={issue.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(issue.status)}
                            <span className={`status-badge status-${issue.status}`}>
                              {t(`status.${issue.status}`)}
                            </span>
                            <span className={`priority-badge ${getPriorityColor(issue.priority)}`}>
                              {t(`priority.${issue.priority}`)}
                            </span>
                          </div>
                          <h4 className="text-lg font-medium text-gray-900 mb-2">
                            {issue.title}
                          </h4>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {issue.description}
                          </p>
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="w-4 h-4 mr-1" />
                            {issue.location?.address || 'Location not specified'}
                            <span className="mx-2">•</span>
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(issue.createdAt).toLocaleDateString()}
                            <span className="mx-2">•</span>
                            <span>{issue.upvotes} upvotes</span>
                          </div>
                        </div>
                        <Link
                          to={`/issues/${issue.id}`}
                          className="btn btn-primary"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
