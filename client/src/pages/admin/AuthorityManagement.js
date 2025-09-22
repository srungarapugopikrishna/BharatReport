import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Edit, Trash2, Users, Building, Phone, Mail } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { authoritiesAPI, categoriesAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AuthorityManagement = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingAuthority, setEditingAuthority] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    level: 'MP',
    designation: '',
    department: '',
    email: '',
    phone: '',
    jurisdiction: {
      area: '',
      ward: '',
      district: '',
      state: '',
      constituency: ''
    },
    categories: [],
    notes: ''
  });

  // Fetch authorities
  const { data: authorities, isLoading: authoritiesLoading } = useQuery(
    'authorities-admin',
    () => authoritiesAPI.getAuthorities({ isActive: true }),
    {
      select: (response) => response.data
    }
  );

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery(
    'categories',
    () => categoriesAPI.getCategories(),
    {
      select: (response) => response.data
    }
  );

  // Create authority mutation
  const createAuthorityMutation = useMutation(
    (data) => authoritiesAPI.createAuthority(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('authorities');
        toast.success('Authority created successfully!');
        setShowForm(false);
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to create authority');
      }
    }
  );

  // Update authority mutation
  const updateAuthorityMutation = useMutation(
    ({ id, data }) => authoritiesAPI.updateAuthority(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('authorities');
        toast.success('Authority updated successfully!');
        setShowForm(false);
        setEditingAuthority(null);
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update authority');
      }
    }
  );

  // Delete authority mutation
  const deleteAuthorityMutation = useMutation(
    (id) => authoritiesAPI.deleteAuthority(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('authorities');
        toast.success('Authority deleted successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to delete authority');
      }
    }
  );

  const resetForm = () => {
    setFormData({
      name: '',
      level: 'MP',
      designation: '',
      department: '',
      email: '',
      phone: '',
      jurisdiction: {
        area: '',
        ward: '',
        district: '',
        state: '',
        constituency: ''
      },
      categories: [],
      notes: ''
    });
  };

  const handleEdit = (authority) => {
    setEditingAuthority(authority);
    setFormData({
      name: authority.name,
      level: authority.level,
      designation: authority.designation,
      department: authority.department || '',
      email: authority.email || '',
      phone: authority.phone || '',
      jurisdiction: authority.jurisdiction || {
        area: '',
        ward: '',
        district: '',
        state: '',
        constituency: ''
      },
      categories: authority.Categories?.map(cat => cat.id) || [],
      notes: authority.notes || ''
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingAuthority) {
      updateAuthorityMutation.mutate({
        id: editingAuthority.id,
        data: formData
      });
    } else {
      createAuthorityMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this authority?')) {
      deleteAuthorityMutation.mutate(id);
    }
  };

  const authorityLevels = [
    'MP', 'MLA', 'Mayor', 'Corporator', 'Ward Member', 
    'Engineer', 'Contractor', 'Supervisor', 'Other'
  ];

  if (authoritiesLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading authorities...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Authority Management</h2>
          <p className="text-gray-600">Manage responsible authorities for different issue categories</p>
        </div>
        <button
          onClick={() => {
            setEditingAuthority(null);
            resetForm();
            setShowForm(true);
          }}
          className="btn btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Authority
        </button>
      </div>

      {/* Authorities List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Authorities</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {authorities?.map((authority) => (
            <div key={authority.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-medium text-gray-900">{authority.name}</h4>
                      <p className="text-sm text-gray-600">{authority.designation}</p>
                      <p className="text-sm text-gray-500">{authority.department}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        {authority.email && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail className="w-4 h-4 mr-1" />
                            {authority.email}
                          </div>
                        )}
                        {authority.phone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="w-4 h-4 mr-1" />
                            {authority.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {authority.level}
                    </span>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        <strong>Jurisdiction:</strong> {authority.jurisdiction?.area}, {authority.jurisdiction?.ward}, {authority.jurisdiction?.district}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Categories:</strong> {authority.Categories?.map(cat => cat.name).join(', ') || 'None'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(authority)}
                    className="p-2 text-gray-400 hover:text-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(authority.id)}
                    className="p-2 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingAuthority ? 'Edit Authority' : 'Add New Authority'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Authority Level *
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="input"
                      required
                    >
                      {authorityLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Designation *
                    </label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jurisdiction
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Area"
                      value={formData.jurisdiction.area}
                      onChange={(e) => setFormData({
                        ...formData,
                        jurisdiction: { ...formData.jurisdiction, area: e.target.value }
                      })}
                      className="input"
                    />
                    <input
                      type="text"
                      placeholder="Ward"
                      value={formData.jurisdiction.ward}
                      onChange={(e) => setFormData({
                        ...formData,
                        jurisdiction: { ...formData.jurisdiction, ward: e.target.value }
                      })}
                      className="input"
                    />
                    <input
                      type="text"
                      placeholder="District"
                      value={formData.jurisdiction.district}
                      onChange={(e) => setFormData({
                        ...formData,
                        jurisdiction: { ...formData.jurisdiction, district: e.target.value }
                      })}
                      className="input"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={formData.jurisdiction.state}
                      onChange={(e) => setFormData({
                        ...formData,
                        jurisdiction: { ...formData.jurisdiction, state: e.target.value }
                      })}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categories
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {categories?.map((category) => (
                      <label key={category.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(category.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                categories: [...formData.categories, category.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                categories: formData.categories.filter(id => id !== category.id)
                              });
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingAuthority(null);
                      resetForm();
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createAuthorityMutation.isLoading || updateAuthorityMutation.isLoading}
                    className="btn btn-primary"
                  >
                    {editingAuthority ? 'Update Authority' : 'Create Authority'}
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

export default AuthorityManagement;
