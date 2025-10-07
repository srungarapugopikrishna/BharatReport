import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Edit, Trash2, Eye, Users } from 'lucide-react';
import { officialsAPI, categoriesAPI, authoritiesAPI } from '../../services/api';
import toast from 'react-hot-toast';

const OfficialsManagement = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    department: '',
    email: '',
    phone: '',
    jurisdiction: { area: '', ward: '', district: '', state: '' },
    authorityId: '',
  });

  // Fetch officials
  const { data: officialsData, isLoading } = useQuery(
    'adminOfficials',
    () => officialsAPI.getOfficials({ limit: 50 }),
    {
      select: (response) => response.data
    }
  );

  // Fetch categories to map official scope
  const { data: authoritiesList } = useQuery(
    'authorities-all',
    () => authoritiesAPI.getAuthorities({ isActive: true }),
    { select: (res) => res.data?.data || [] }
  );

  const createOfficialMutation = useMutation(
    (payload) => officialsAPI.createOfficial(payload),
    {
      onSuccess: () => {
        toast.success('Official created');
        queryClient.invalidateQueries('adminOfficials');
        setShowForm(false);
        setFormData({
          name: '', designation: '', department: '', email: '', phone: '',
          jurisdiction: { area: '', ward: '', district: '', state: '' },
          authorityId: '',
        });
      },
      onError: (e) => toast.error(e.response?.data?.error || 'Failed to create official')
    }
  );

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Officials Management</h2>
          <p className="text-gray-600">Manage government officials and their jurisdictions</p>
        </div>
        <button className="btn btn-primary flex items-center" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Official
        </button>
      </div>

      {/* Officials List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Official
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {officialsData?.officials?.map((official) => (
                <tr key={official.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {official.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {official.designation}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {official.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      {official.email && (
                        <div className="text-xs text-gray-500">{official.email}</div>
                      )}
                      {official.phone && (
                        <div className="text-xs text-gray-500">{official.phone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${official.resolutionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {official.resolutionRate}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {official.responseTime}h avg
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      official.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {official.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-primary-600 hover:text-primary-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Official</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createOfficialMutation.mutate(formData);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      className="input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction - Area</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.jurisdiction.area}
                      onChange={(e) => setFormData({ ...formData, jurisdiction: { ...formData.jurisdiction, area: e.target.value } })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction - Ward</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.jurisdiction.ward}
                      onChange={(e) => setFormData({ ...formData, jurisdiction: { ...formData.jurisdiction, ward: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction - District</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.jurisdiction.district}
                      onChange={(e) => setFormData({ ...formData, jurisdiction: { ...formData.jurisdiction, district: e.target.value } })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction - State</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.jurisdiction.state}
                      onChange={(e) => setFormData({ ...formData, jurisdiction: { ...formData.jurisdiction, state: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Authority Level *</label>
                    <select
                      className="input"
                      value={formData.authorityId}
                      onChange={(e) => setFormData({ ...formData, authorityId: e.target.value })}
                      required
                    >
                      <option value="">Select authority</option>
                      {authoritiesList.map((a) => (
                        <option key={a.id} value={a.id}>
                          {(a.name || a.authorityLevel || a.level || 'Unknown')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={createOfficialMutation.isLoading}>
                    {createOfficialMutation.isLoading ? 'Saving...' : 'Create Official'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficialsManagement;
