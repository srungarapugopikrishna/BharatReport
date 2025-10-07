import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Eye, User, Mail, Phone, Ban, RotateCcw } from 'lucide-react';
import { adminAPI } from '../../services/api';

const UsersManagement = () => {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery(
    'admin-users',
    () => adminAPI.listUsers().then(r => r.data.users || r.data)
  );

  const banMutation = useMutation(
    (id) => adminAPI.banUser(id),
    { onSuccess: () => queryClient.invalidateQueries('admin-users') }
  );
  const unbanMutation = useMutation(
    (id) => adminAPI.unbanUser(id),
    { onSuccess: () => queryClient.invalidateQueries('admin-users') }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
          <p className="text-gray-600">Manage platform users and their permissions</p>
        </div>
      </div>

      {/* Users List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td className="p-6 text-sm text-gray-500">Loading...</td></tr>
              ) : (users || []).map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {u.name || '(no name)'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {u.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      {u.email && (
                        <div className="flex items-center text-xs text-gray-500 mb-1">
                          <Mail className="w-3 h-3 mr-1" />
                          {u.email}
                        </div>
                      )}
                      {u.phone && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Phone className="w-3 h-3 mr-1" />
                          {u.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      u.role === 'admin' ? 'bg-red-100 text-red-800' :
                      u.role === 'official' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {u.role?.charAt(0).toUpperCase() + u.role?.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      u.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {u.isBanned ? (
                        <button className="btn btn-secondary px-2 py-1" onClick={() => unbanMutation.mutate(u.id)} disabled={unbanMutation.isLoading}>
                          <RotateCcw className="w-4 h-4" /> Unban
                        </button>
                      ) : (
                        <button className="btn btn-secondary px-2 py-1" onClick={() => banMutation.mutate(u.id)} disabled={banMutation.isLoading}>
                          <Ban className="w-4 h-4" /> Ban
                        </button>
                      )}
                      <a className="text-primary-600 hover:text-primary-900" href={`mailto:${u.email}`}>
                        <Eye className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersManagement;
