import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { MapPin, Users, TrendingUp, CheckCircle, ArrowRight, Plus, Eye, BarChart3, Share2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { issuesAPI, analyticsAPI } from '../services/api';
import toast from 'react-hot-toast';

const Home = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    totalIssues: 0,
    resolvedIssues: 0,
    pendingIssues: 0,
    resolutionRate: 0
  });

  // Fetch recent issues
  const { data: recentIssues, isLoading: issuesLoading } = useQuery(
    'recentIssues',
    () => issuesAPI.getIssues({ limit: 6, sortBy: 'createdAt', sortOrder: 'DESC' }),
    {
      select: (response) => response.data.issues
    }
  );

  // Fetch analytics data
  const { data: analyticsData } = useQuery(
    'homeAnalytics',
    () => analyticsAPI.getDashboard(),
    {
      select: (response) => response.data,
      onSuccess: (data) => {
        setStats({
          totalIssues: data.overview.totalIssues,
          resolvedIssues: data.overview.issuesByStatus.resolved || 0,
          pendingIssues: data.overview.issuesByStatus.open || 0,
          resolutionRate: parseFloat(data.overview.resolutionRate) || 0
        });
      }
    }
  );

  const features = [
    {
      icon: <Plus className="w-8 h-8 text-primary-600" />,
      title: t('home.report_issue'),
      description: 'Report civic issues with photos, location, and detailed descriptions',
      link: '/report'
    },
    {
      icon: <Eye className="w-8 h-8 text-green-600" />,
      title: t('home.view_issues'),
      description: 'Browse and track issues in your area with real-time updates',
      link: '/issues'
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-purple-600" />,
      title: t('home.analytics'),
      description: 'View analytics and insights about civic issues and resolutions',
      link: '/analytics'
    }
  ];

  const categories = [
    { name: 'Roads & Transport', color: 'bg-blue-500', count: 0 },
    { name: 'Water Supply', color: 'bg-cyan-500', count: 0 },
    { name: 'Electricity', color: 'bg-yellow-500', count: 0 },
    { name: 'Sanitation', color: 'bg-green-500', count: 0 },
    { name: 'Health & Safety', color: 'bg-pink-500', count: 0 },
    { name: 'Environment', color: 'bg-emerald-500', count: 0 }
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('home.title')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              {t('home.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={isAuthenticated ? '/report' : '/register'}
                className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
              >
                {t('home.report_issue')}
              </Link>
              <Link
                to="/issues"
                className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 text-lg font-semibold"
              >
                {t('home.view_issues')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {stats.totalIssues.toLocaleString()}
              </h3>
              <p className="text-gray-600">Total Issues Reported</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {stats.resolvedIssues.toLocaleString()}
              </h3>
              <p className="text-gray-600">Issues Resolved</p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {stats.resolutionRate.toFixed(1)}%
              </h3>
              <p className="text-gray-600">Resolution Rate</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {stats.pendingIssues.toLocaleString()}
              </h3>
              <p className="text-gray-600">Pending Issues</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to report and track civic issues in your community
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {feature.description}
                </p>
                <Link
                  to={feature.link}
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Issues Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Recent Issues
              </h2>
              <p className="text-xl text-gray-600">
                Latest civic issues reported by citizens
              </p>
            </div>
            <Link
              to="/issues"
              className="btn btn-primary flex items-center"
            >
              View All Issues
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          {issuesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="card animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentIssues?.map((issue) => (
                <div key={issue.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`status-badge status-${issue.status}`}>
                      {t(`status.${issue.status}`)}
                    </span>
                    <span className={`priority-badge priority-${issue.priority}`}>
                      {t(`priority.${issue.priority}`)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {issue.title}
                  </h3>
                  
                  {/* Images */}
                  {issue.media && issue.media.length > 0 && (
                    <div className="mb-3">
                      <div className="grid grid-cols-2 gap-2">
                        {issue.media.slice(0, 2).map((image, index) => (
                          <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
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
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {issue.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      {issue.location?.address || 'Location not specified'}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleShare(issue)}
                        className="text-gray-500 hover:text-primary-600 transition-colors"
                        title="Share this issue"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/issues/${issue.id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of citizens who are actively improving their communities 
            by reporting and tracking civic issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={isAuthenticated ? '/report' : '/register'}
              className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
            >
              {isAuthenticated ? 'Report an Issue' : 'Get Started'}
            </Link>
            <Link
              to="/analytics"
              className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 text-lg font-semibold"
            >
              View Analytics
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
