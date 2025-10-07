import React, { useMemo, useState } from 'react';
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
  const [customLevel, setCustomLevel] = useState('');
  const [formData, setFormData] = useState({
    level: '',
    categoryId: '',
    subcategoryId: '',
    description: ''
  });

  // Fetch authorities
  const { data: authorities, isLoading: authoritiesLoading } = useQuery(
    'authorities-admin',
    () => authoritiesAPI.getAuthorities({ isActive: true }),
    {
      select: (response) => response.data?.data || []
    }
  );

  // Fetch categories (with subcategories)
  const { data: categories, isLoading: categoriesLoading } = useQuery(
    'categories',
    () => categoriesAPI.getCategories(),
    { select: (response) => response.data }
  );

  // Derived authority levels based on selected category/subcategory
  const dynamicAuthorityLevels = useMemo(() => {
    if (!categories || !formData.categoryId) return [];
    const category = categories.find(c => c.id === formData.categoryId);
    if (!category) return [];
    if (formData.subcategoryId) {
      const sub = category.Subcategories?.find(sc => sc.id === formData.subcategoryId);
      return (sub?.authorityTypes || []).filter(Boolean);
    }
    // No subcategory: union of all subcategory authorityTypes
    const set = new Set();
    (category.Subcategories || []).forEach(sc => {
      (sc.authorityTypes || []).forEach(t => t && set.add(t));
    });
    return Array.from(set);
  }, [categories, formData.categoryId, formData.subcategoryId]);

  // Create authority mutation
  const createAuthorityMutation = useMutation(
    (data) => authoritiesAPI.createAuthority(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('authorities-admin');
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
        queryClient.invalidateQueries('authorities-admin');
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
        queryClient.invalidateQueries('authorities-admin');
        toast.success('Authority deleted successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to delete authority');
      }
    }
  );

  const resetForm = () => {
    setFormData({
      level: '',
      categoryId: '',
      subcategoryId: '',
      description: ''
    });
    setCustomLevel('');
  };

  const handleEdit = (authority) => {
    setEditingAuthority(authority);
    setCustomLevel('');
    setFormData({
      level: authority.level,
      categoryId: authority.Categories && authority.Categories[0] ? authority.Categories[0].id : '',
      subcategoryId: authority.Subcategories && authority.Subcategories[0] ? authority.Subcategories[0].id : '',
      description: authority.description || ''
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const levelLabel = formData.level === '__custom__' ? customLevel.trim() : formData.level;
    if (formData.level === '__custom__' && !levelLabel) {
      toast.error('Please enter a custom authority level');
      return;
    }
    const payload = {
      level: formData.level === '__custom__' ? levelLabel : formData.level,
      description: formData.notes || levelLabel,
      categories: formData.categoryId ? [formData.categoryId] : [],
      subcategories: formData.subcategoryId ? [formData.subcategoryId] : []
    };

    if (editingAuthority) {
      updateAuthorityMutation.mutate({ id: editingAuthority.id, data: payload });
    } else {
      createAuthorityMutation.mutate(payload);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this authority?')) {
      deleteAuthorityMutation.mutate(id);
    }
  };

  const authorityLevels = useMemo(() => {
    const base = dynamicAuthorityLevels && dynamicAuthorityLevels.length > 0
      ? dynamicAuthorityLevels
      : [];
    return [...base];
  }, [dynamicAuthorityLevels]);

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
            setCustomLevel('');
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
                      <h4 className="text-lg font-medium text-gray-900">{authority.level}</h4>
                      <p className="text-sm text-gray-600">{authority.description}</p>
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
                  {/* Show badge only if description differs; otherwise avoid duplicate look */}
                  {(!authority.description || authority.description !== authority.level) && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {authority.level}
                    </span>
                  )}
                  <div className="mt-2">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    className="input"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, subcategoryId: '', level: '' })}
                    required
                  >
                    <option value="">Select category</option>
                    {categories?.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                {formData.categoryId && categories?.find(c => c.id === formData.categoryId)?.Subcategories?.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory (optional)</label>
                    <select
                      className="input"
                      value={formData.subcategoryId}
                      onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value, level: '' })}
                    >
                      <option value="">Select subcategory</option>
                      {categories?.find(c => c.id === formData.categoryId)?.Subcategories?.map((sc) => (
                        <option key={sc.id} value={sc.id}>{sc.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Authority Level *
                  </label>
                  <div className="flex space-x-2">
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="input flex-1"
                      required
                      disabled={!formData.categoryId}
                    >
                      <option value="">{authorityLevels.length ? 'Select level' : 'Select category first'}</option>
                      {authorityLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                      <option value="__custom__">Custom…</option>
                    </select>
                    {formData.level === '__custom__' && (
                      <input
                        type="text"
                        placeholder="Enter new authority level"
                        value={customLevel}
                        onChange={(e) => setCustomLevel(e.target.value)}
                        className="input flex-1"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    rows={3}
                    placeholder="Describe this authority level (responsibilities, scope, etc.)"
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
