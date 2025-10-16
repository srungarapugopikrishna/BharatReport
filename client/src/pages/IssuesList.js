import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, Calendar, ThumbsUp, MessageCircle, AlertCircle, Clock, CheckCircle, Share2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { issuesAPI } from '../services/api';
import toast from 'react-hot-toast';

const IssuesList = () => {
  const { t } = useLanguage();
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    priority: '',
    page: 1,
    limit: 12
  });

  // Fetch issues with filters
  const { data: issuesData, isLoading, error } = useQuery(
    ['issues', filters],
    () => issuesAPI.getIssues(filters),
    {
      select: (response) => response.data,
      keepPreviousData: true
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

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

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'verified', label: 'Verified' },
    { value: 'closed', label: 'Closed' }
  ];

  const priorityOptions = [
    { value: '', label: 'All Priority' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Issues</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Community Issues</h1>
          <p className="text-gray-600 mt-2">
            Browse and track civic issues reported by citizens in your area.
          </p>
        </div>

        {/* Filters */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Issues
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="input pl-10"
                  placeholder="Search by title or description..."
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="input"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="input"
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="input"
              >
                <option value="">All Categories</option>
                {/* In a real app, you'd fetch categories here */}
                <option value="roads">Roads & Transport</option>
                <option value="water">Water Supply</option>
                <option value="electricity">Electricity</option>
                <option value="sanitation">Sanitation</option>
                <option value="health">Health & Safety</option>
                <option value="environment">Environment</option>
              </select>
            </div>
          </div>
        </div>

        {/* Issues Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="card animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : issuesData?.issues?.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {issuesData.issues.map((issue) => (
                <div key={issue.id} className="card hover:shadow-lg transition-shadow">
                  {/* Status and Priority */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(issue.status)}
                      <span className={`status-badge status-${issue.status}`}>
                        {t(`status.${issue.status}`)}
                      </span>
                    </div>
                    <span className={`priority-badge ${getPriorityColor(issue.priority)}`}>
                      {t(`priority.${issue.priority}`)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {issue.title}
                  </h3>

                  {/* Images */}
                  {issue.media && issue.media.length > 0 && (
                    <div className="mb-4">
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
                                <span className="text-white text-sm font-medium">
                                  +{issue.media.length - 2} more
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {issue.description}
                  </p>

                  {/* Category */}
                  {issue.Category && (
                    <div className="mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {issue.Category.name}
                      </span>
                    </div>
                  )}

                  {/* Assigned Authority */}
                  {issue.Authority && (
                    <div className="mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs font-medium text-blue-600">A</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{issue.Authority.name}</p>
                          <p className="text-xs text-gray-500">{issue.Authority.designation} • {issue.Authority.level}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="line-clamp-1">
                      {issue.location?.address || 'Location not specified'}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        {issue.upvotes}
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {issue.Comments?.length || 0}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Link
                      to={`/issues/${issue.id}`}
                      className="btn btn-primary flex-1"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleShare(issue)}
                      className="btn btn-secondary px-3"
                      title="Share this issue"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {issuesData.pagination && issuesData.pagination.pages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((issuesData.pagination.page - 1) * issuesData.pagination.limit) + 1} to{' '}
                  {Math.min(issuesData.pagination.page * issuesData.pagination.limit, issuesData.pagination.total)} of{' '}
                  {issuesData.pagination.total} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page === 1}
                    className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="flex items-center px-4 py-2 text-sm text-gray-700">
                    Page {filters.page} of {issuesData.pagination.pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page === issuesData.pagination.pages}
                    className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
            <p className="text-gray-500 mb-6">
              {filters.search || filters.status || filters.category || filters.priority
                ? 'Try adjusting your filters to see more results.'
                : 'No civic issues have been reported yet.'}
            </p>
            <Link
              to="/report"
              className="btn btn-primary"
            >
              Report the First Issue
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssuesList;
