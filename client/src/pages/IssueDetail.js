import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { MapPin, Calendar, ThumbsUp, MessageCircle, User, Clock, CheckCircle, AlertCircle, ArrowLeft, Share2, Edit } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { issuesAPI } from '../services/api';
import toast from 'react-hot-toast';

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);

  // Function to open Google Maps with coordinates
  const openInGoogleMaps = (lat, lng) => {
    if (lat && lng) {
      const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  // Function to share issue - Updated
  const handleShare = async () => {
    if (!issue) {
      toast.error('Issue data not available');
      return;
    }

    const shareData = {
      title: issue.title,
      text: issue.description,
      url: window.location.href
    };

    try {
      // Check if Web Share API is supported
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Issue shared successfully!');
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Issue link copied to clipboard!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        // If Web Share API fails, try clipboard fallback
        try {
          await navigator.clipboard.writeText(window.location.href);
          toast.success('Issue link copied to clipboard!');
        } catch (clipboardError) {
          console.error('Failed to copy to clipboard:', clipboardError);
          toast.error('Failed to share issue. Please copy the URL manually.');
        }
      }
    }
  };

  // Fetch issue details
  const { data: issue, isLoading, error } = useQuery(
    ['issue', id],
    () => issuesAPI.getIssue(id),
    {
      select: (response) => {
        console.log('Issue API response:', response);
        const issueData = response.data;
        console.log('Issue data received:', issueData);
        console.log('Media data:', issueData.media);
        if (issueData.media) {
          issueData.media.forEach((media, index) => {
            console.log(`Media ${index}:`, media, 'Type:', typeof media, 'Starts with data:', media?.startsWith?.('data:'));
          });
        }
        return issueData;
      }
    }
  );

  // Upvote mutation
  const upvoteMutation = useMutation(
    () => issuesAPI.upvoteIssue(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['issue', id]);
        toast.success('Issue upvoted!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to upvote issue');
      }
    }
  );

  // Add comment mutation
  const addCommentMutation = useMutation(
    (commentData) => issuesAPI.addComment(id, commentData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['issue', id]);
        setNewComment('');
        setIsCommenting(false);
        toast.success('Comment added!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to add comment');
      }
    }
  );

  const handleUpvote = () => {
    if (!isAuthenticated) {
      toast.error('Please login to upvote issues');
      return;
    }
    upvoteMutation.mutate();
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    if (!isAuthenticated) {
      toast.error('Please login to add comments');
      return;
    }

    addCommentMutation.mutate({
      content: newComment.trim()
    });
  };

  // Status update mutation
  const statusUpdateMutation = useMutation(
    (newStatus) => issuesAPI.updateIssueStatus(id, { status: newStatus }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['issue', id]);
        toast.success('Issue status updated successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update status');
      }
    }
  );

  const handleStatusUpdate = (newStatus) => {
    if (newStatus === issue.status) return;
    
    statusUpdateMutation.mutate(newStatus);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'open':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'closed':
        return <CheckCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Issue Not Found</h2>
          <p className="text-gray-600 mb-6">The issue you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/issues')}
            className="btn btn-primary"
          >
            Back to Issues
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        {/* Issue Header */}
        <div className="card mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                {getStatusIcon(issue.status)}
                <span className={`status-badge status-${issue.status}`}>
                  {t(`status.${issue.status}`)}
                </span>
                <span className={`priority-badge ${getPriorityColor(issue.priority)}`}>
                  {t(`priority.${issue.priority}`)}
                </span>
                <span className="text-sm text-gray-500">
                  Issue #{issue.issueId}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {issue.title}
              </h1>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Calendar className="w-4 h-4 mr-1" />
                Reported on {new Date(issue.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                {issue.User && (
                  <>
                    <span className="mx-2">•</span>
                    <User className="w-4 h-4 mr-1" />
                    by {issue.User.name}
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleUpvote}
                disabled={upvoteMutation.isLoading}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                {issue.upvotes} Upvotes
              </button>
              <button 
                onClick={handleShare}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </button>
              {/* Edit button for issue reporter */}
              {isAuthenticated && user && (
                (user.id === issue.userId) || 
                (user.role === 'admin') || 
                (issue.isAnonymous && user.isAnonymous && user.name === issue.User?.name)
              ) && (
                <button 
                  onClick={() => navigate(`/issues/${id}/edit`)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit Issue
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {issue.description}
            </p>
          </div>

          {/* Category and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Category</h4>
              <div className="flex items-center">
                {issue.Category && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {issue.Category.name}
                  </span>
                )}
                {issue.Subcategory && (
                  <span className="ml-2 text-sm text-gray-600">
                    • {issue.Subcategory.name}
                  </span>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Location</h4>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                {issue.location?.address || 'Location not specified'}
              </div>
              {issue.location?.lat && issue.location?.lng && (
                <div className="text-xs text-gray-500">
                  <span className="text-gray-400">Coordinates: </span>
                  <button
                    onClick={() => openInGoogleMaps(issue.location.lat, issue.location.lng)}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-mono cursor-pointer"
                    title="Click to open in Google Maps"
                  >
                    {issue.location.lat.toFixed(6)}, {issue.location.lng.toFixed(6)}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Authority */}
          {issue.Authority && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Assigned Authority</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium text-gray-900">{issue.Authority.name}</h5>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {issue.Authority.level}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{issue.Authority.designation}</p>
                    {issue.Authority.department && (
                      <p className="text-xs text-gray-500 mt-1">{issue.Authority.department}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      {issue.Authority.email && (
                        <span>📧 {issue.Authority.email}</span>
                      )}
                      {issue.Authority.phone && (
                        <span>📞 {issue.Authority.phone}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Media */}
          {issue.media && issue.media.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Attachments</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {issue.media.map((media, index) => {
                  // Debug: log the media content
                  console.log(`Media ${index}:`, media, typeof media);
                  
                  // Check if media is a data URL, regular URL, or file path
                  const isDataUrl = typeof media === 'string' && media.startsWith('data:');
                  const isUrl = typeof media === 'string' && (media.startsWith('http') || media.startsWith('/'));
                  const isImageFile = typeof media === 'string' && /\.(jpg|jpeg|png|gif|webp)$/i.test(media);
                  const isImage = isDataUrl || isUrl || isImageFile;
                  
                  console.log(`Media ${index} - isDataUrl:`, isDataUrl, 'isImage:', isImage, 'media length:', media?.length);
                  
                  return (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                      {isDataUrl || isUrl ? (
                        <img 
                          src={media} 
                          alt={`Attachment ${index + 1}`}
                          className="w-full h-full object-cover"
                          onLoad={() => console.log(`Image ${index} loaded successfully`)}
                          onError={(e) => {
                            console.error(`Image ${index} failed to load:`, e.target.src);
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                      ) : isImageFile ? (
                        <div className="w-full h-full flex items-center justify-center bg-blue-50">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span className="text-blue-700 text-sm font-medium block">{media}</span>
                            <span className="text-blue-500 text-xs block mt-1">Image File</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <span className="text-gray-500 text-sm block">
                              {typeof media === 'string' ? `File ${index + 1}` : `Media ${index + 1}`}
                            </span>
                            <span className="text-xs text-gray-400 block mt-1">
                              {typeof media === 'string' ? 'Unknown type' : 'Unknown type'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Citizen Status Update - All authenticated users can update status for accountability */}
          {isAuthenticated && user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-blue-800 mb-3">Update Issue Status</h4>
              <div className="flex flex-wrap gap-2">
                {['open', 'in_progress', 'resolved', 'verified'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      issue.status === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-100'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </button>
                ))}
              </div>
              <p className="text-blue-600 text-xs mt-2">
                As the reporter, you can update the status to reflect the current situation
              </p>
            </div>
          )}

          {/* Resolution Details */}
          {issue.status === 'resolved' && issue.resolutionNotes && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-green-800 mb-2">Resolution Notes</h4>
              <p className="text-green-700 text-sm">
                {issue.resolutionNotes}
              </p>
              {issue.resolvedAt && (
                <p className="text-green-600 text-xs mt-2">
                  Resolved on {new Date(issue.resolvedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Comments ({issue.Comments?.length || 0})
            </h3>
            {isAuthenticated && (
              <button
                onClick={() => setIsCommenting(!isCommenting)}
                className="btn btn-primary"
              >
                Add Comment
              </button>
            )}
          </div>

          {/* Add Comment Form */}
          {isCommenting && (
            <form onSubmit={handleAddComment} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              <div className="flex justify-end space-x-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCommenting(false);
                    setNewComment('');
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addCommentMutation.isLoading}
                  className="btn btn-primary"
                >
                  {addCommentMutation.isLoading ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {issue.Comments?.length > 0 ? (
              issue.Comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {comment.User?.name || comment.Official?.name || 'Anonymous'}
                      </span>
                      {comment.isOfficial && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Official
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;
