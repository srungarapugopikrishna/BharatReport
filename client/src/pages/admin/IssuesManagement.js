import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminAPI } from '../../services/api';
import { CheckCircle2, XCircle, RefreshCw, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const IssuesManagement = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('pending');
  const [search, setSearch] = useState('');

  const { data: issues, isLoading } = useQuery(
    ['admin-issues', statusFilter, search],
    () => adminAPI.getIssues({ status: statusFilter, q: search }).then(r => r.data.issues || r.data),
  );

  const approveMutation = useMutation(
    (id) => adminAPI.approveIssue(id),
    {
      onSuccess: () => {
        toast.success('Issue approved');
        queryClient.invalidateQueries('admin-issues');
      },
      onError: (e) => toast.error(e.response?.data?.error || 'Approve failed')
    }
  );

  const rejectMutation = useMutation(
    ({ id, reason }) => adminAPI.rejectIssue(id, reason),
    {
      onSuccess: () => {
        toast.success('Issue rejected');
        queryClient.invalidateQueries('admin-issues');
      },
      onError: (e) => toast.error(e.response?.data?.error || 'Reject failed')
    }
  );

  const handleReject = (id) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;
    rejectMutation.mutate({ id, reason });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Issues Moderation</h2>
          <p className="text-gray-600">Approve or reject newly submitted issues</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="open">Open</option>
            <option value="rejected">Rejected</option>
            <option value="resolved">Resolved</option>
          </select>
          <input
            className="input"
            placeholder="Search title/description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-secondary" onClick={() => queryClient.invalidateQueries('admin-issues')}>
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{statusFilter === 'pending' ? 'Pending' : 'All'} Issues</h3>
        </div>

        {isLoading ? (
          <div className="p-6">Loading...</div>
        ) : (
          <div className="divide-y">
            {(issues || []).map((issue) => (
              <div key={issue.id} className="p-6 flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm text-gray-500">#{issue.issueId}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      issue.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      issue.status === 'open' ? 'bg-blue-100 text-blue-800' :
                      issue.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {issue.status}
                    </span>
                  </div>
                  <h4 className="text-base font-semibold text-gray-900">{issue.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{issue.description}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    {issue.Category?.name} • {issue.Subcategory?.name} • {new Date(issue.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Link className="btn btn-secondary" to={`/issues/${issue.id}`}>
                    <Eye className="w-4 h-4 mr-1" /> View
                  </Link>
                  {issue.status === 'pending' && (
                    <>
                      <button
                        className="btn btn-primary"
                        onClick={() => approveMutation.mutate(issue.id)}
                        disabled={approveMutation.isLoading}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleReject(issue.id)}
                        disabled={rejectMutation.isLoading}
                      >
                        <XCircle className="w-4 h-4 mr-1" /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {(!issues || issues.length === 0) && (
              <div className="p-6 text-sm text-gray-500">No issues found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IssuesManagement;


