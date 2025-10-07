import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { categoriesAPI, adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CategoriesManagement = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [subcatModalOpen, setSubcatModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [subForm, setSubForm] = useState({ name: '', nameHindi: '', nameTelugu: '', description: '', authorityTypes: [], isActive: true });
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    nameHindi: '',
    nameTelugu: '',
    description: '',
    color: '#2563eb',
    isActive: true,
  });
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categories, isLoading } = useQuery(
    'adminCategories',
    () => adminAPI.listCategories(),
    {
      select: (response) => response.data
    }
  );

  // Delete category mutation
  const deleteCategoryMutation = useMutation(
    (categoryId) => adminAPI.deleteCategory(categoryId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminCategories');
        toast.success('Category deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to delete category');
      }
    }
  );

  const handleDelete = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  // Subcategory mutations
  const createSubMutation = useMutation(
    ({ categoryId, data }) => categoriesAPI.createSubcategory(categoryId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminCategories');
        toast.success('Subcategory created');
        setSubForm({ name: '', nameHindi: '', nameTelugu: '', description: '' });
      },
      onError: (e) => toast.error(e.response?.data?.error || 'Failed to create subcategory')
    }
  );
  const updateSubMutation = useMutation(
    ({ id, data }) => categoriesAPI.updateSubcategory(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminCategories');
        toast.success('Subcategory updated');
        setEditingSubcategory(null);
        setSubForm({ name: '', nameHindi: '', nameTelugu: '', description: '' });
      },
      onError: (e) => toast.error(e.response?.data?.error || 'Failed to update subcategory')
    }
  );
  const deleteSubMutation = useMutation(
    (id) => categoriesAPI.deleteSubcategory(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminCategories');
        toast.success('Subcategory removed');
      },
      onError: (e) => toast.error(e.response?.data?.error || 'Failed to delete subcategory')
    }
  );

  const openSubcategories = (category) => {
    setActiveCategory(category);
    setEditingSubcategory(null);
    setSubForm({ name: '', nameHindi: '', nameTelugu: '', description: '', authorityTypes: [], isActive: true });
    setSubForm({ name: '', nameHindi: '', nameTelugu: '', description: '', authorityTypes: [], isActive: true });
    setSubForm({ name: '', nameHindi: '', nameTelugu: '', description: '', authorityTypes: [], isActive: true });
    setSubcatModalOpen(true);
  };

  const submitSubcategory = (e) => {
    e.preventDefault();
    if (!activeCategory) return;
    const payload = { ...subForm };
    if (editingSubcategory) {
      updateSubMutation.mutate({ id: editingSubcategory.id, data: payload }, {
        onSuccess: (updated) => {
          setActiveCategory((prev) => {
            if (!prev) return prev;
            const updatedSubs = (prev.Subcategories || []).map((s) => s.id === editingSubcategory.id ? { ...s, ...payload } : s);
            return { ...prev, Subcategories: updatedSubs };
          });
        }
      });
    } else {
      createSubMutation.mutate({ categoryId: activeCategory.id, data: payload }, {
        onSuccess: (created) => {
          setActiveCategory((prev) => prev ? { ...prev, Subcategories: [...(prev.Subcategories || []), created] } : prev);
        }
      });
    }
  };

  const toggleSubcategoryActive = (sc) => {
    updateSubMutation.mutate({ id: sc.id, data: { isActive: !sc.isActive } }, {
      onSuccess: () => {
        setActiveCategory((prev) => {
          if (!prev) return prev;
          const updatedSubs = (prev.Subcategories || []).map((s) => s.id === sc.id ? { ...s, isActive: !sc.isActive } : s);
          return { ...prev, Subcategories: updatedSubs };
        });
      }
    });
  };

  // Create category
  const createCategoryMutation = useMutation(
    (payload) => adminAPI.createCategory(payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminCategories');
        toast.success('Category created successfully');
        setIsAddModalOpen(false);
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to create category');
      }
    }
  );

  // Update category
  const updateCategoryMutation = useMutation(
    ({ id, data }) => adminAPI.updateCategory(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminCategories');
        toast.success('Category updated successfully');
        setEditingCategory(null);
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update category');
      }
    }
  );

  const resetForm = () => {
    setFormData({
      name: '',
      nameHindi: '',
      nameTelugu: '',
      description: '',
      color: '#2563eb',
      isActive: true,
    });
  };

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name || '',
        nameHindi: editingCategory.nameHindi || '',
        nameTelugu: editingCategory.nameTelugu || '',
        description: editingCategory.description || '',
        color: editingCategory.color || '#2563eb',
        isActive: Boolean(editingCategory.isActive),
      });
    }
  }, [editingCategory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    const payload = { ...formData };
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data: payload });
    } else {
      createCategoryMutation.mutate(payload);
    }
  };

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
          <h2 className="text-2xl font-bold text-gray-900">Categories Management</h2>
          <p className="text-gray-600">Manage issue categories and subcategories</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </button>
      </div>

      {/* Categories List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subcategories
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Color
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[24rem] min-w-[24rem]">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories?.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded mr-3"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {category.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {category.nameHindi && `Hindi: ${category.nameHindi}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {category.nameTelugu && `Telugu: ${category.nameTelugu}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category.Subcategories?.length || 0} subcategories
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div 
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="ml-2 text-sm text-gray-600">
                        {category.color}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      category.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium w-[24rem] min-w-[24rem] align-top">
                    <div className="flex flex-wrap items-center gap-3 w-full">
                      <button
                        onClick={() => openSubcategories(category)}
                        className="text-primary-600 hover:text-primary-900 basis-full w-full text-left"
                      >
                        Manage Subcategories
                      </button>
                      <button
                        onClick={() => setEditingCategory(category)}
                        className="text-primary-600 hover:text-primary-900 flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => updateCategoryMutation.mutate({ id: category.id, data: { isActive: !category.isActive } })}
                        className="text-gray-700 hover:text-gray-900"
                        disabled={updateCategoryMutation.isLoading}
                      >
                        {category.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={deleteCategoryMutation.isLoading}
                      >
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

      {/* Add/Edit Modal */}
      {(isAddModalOpen || editingCategory) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[30rem] shadow-lg rounded-md bg-white">
            <div className="mt-1">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Roads & Transport"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="subIsActive"
                    type="checkbox"
                    className="checkbox"
                    checked={!!subForm.isActive}
                    onChange={(e) => setSubForm({ ...subForm, isActive: e.target.checked })}
                  />
                  <label htmlFor="subIsActive" className="text-sm text-gray-700">Active</label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name (Hindi)</label>
                    <input
                      type="text"
                      className="input w-full"
                      value={formData.nameHindi}
                      onChange={(e) => setFormData({ ...formData, nameHindi: e.target.value })}
                      placeholder="हिंदी नाम"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name (Telugu)</label>
                    <input
                      type="text"
                      className="input w-full"
                      value={formData.nameTelugu}
                      onChange={(e) => setFormData({ ...formData, nameTelugu: e.target.value })}
                      placeholder="తెలుగు పేరు"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    className="input w-full"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Short description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Color</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        className="h-10 w-14 p-0 border rounded"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      />
                      <input
                        type="text"
                        className="input flex-1"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="#2563eb"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="isActive"
                      type="checkbox"
                      className="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setIsAddModalOpen(false); setEditingCategory(null); resetForm(); }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={createCategoryMutation.isLoading || updateCategoryMutation.isLoading}
                  >
                    {editingCategory ? (updateCategoryMutation.isLoading ? 'Updating...' : 'Update Category') : (createCategoryMutation.isLoading ? 'Adding...' : 'Add Category')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Subcategories Modal */}
      {subcatModalOpen && activeCategory && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-[54rem] shadow-lg rounded-md bg-white">
            <div className="mt-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Subcategories • {activeCategory.name}</h3>
                <button className="btn btn-secondary" onClick={() => { setSubcatModalOpen(false); setActiveCategory(null); }}>Close</button>
              </div>

              <form onSubmit={submitSubcategory} className="space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input className="input w-full" value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <input className="input w-full" value={subForm.description} onChange={(e) => setSubForm({ ...subForm, description: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name (Hindi)</label>
                    <input className="input w-full" value={subForm.nameHindi} onChange={(e) => setSubForm({ ...subForm, nameHindi: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name (Telugu)</label>
                    <input className="input w-full" value={subForm.nameTelugu} onChange={(e) => setSubForm({ ...subForm, nameTelugu: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Authority Types (tags)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(subForm.authorityTypes || []).map((tag, idx) => (
                      <span key={`${tag}-${idx}`} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">
                        {tag}
                        <button type="button" className="ml-1 text-gray-500 hover:text-red-600" onClick={() => setSubForm({ ...subForm, authorityTypes: subForm.authorityTypes.filter((_, i) => i !== idx) })}>×</button>
                      </span>
                    ))}
                  </div>
                  <input
                    className="input w-full"
                    placeholder="Type a role (e.g., Traffic Police) and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = e.currentTarget.value.trim();
                        if (val) {
                          setSubForm({ ...subForm, authorityTypes: Array.from(new Set([...(subForm.authorityTypes || []), val])) });
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  {editingSubcategory && (
                    <button type="button" className="btn btn-secondary" onClick={() => { setEditingSubcategory(null); setSubForm({ name: '', nameHindi: '', nameTelugu: '', description: '', authorityTypes: [] }); }}>Cancel Edit</button>
                  )}
                  <button type="submit" className="btn btn-primary" disabled={createSubMutation.isLoading || updateSubMutation.isLoading}>
                    {editingSubcategory ? (updateSubMutation.isLoading ? 'Updating...' : 'Update Subcategory') : (createSubMutation.isLoading ? 'Adding...' : 'Add Subcategory')}
                  </button>
                </div>
              </form>

              <div className="border rounded">
                <div className="grid grid-cols-12 px-4 py-2 text-xs font-medium text-gray-500 border-b">
                  <div className="col-span-4">Name</div>
                  <div className="col-span-4">Description</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Actions</div>
                </div>
                {(activeCategory.Subcategories || []).map((sc) => (
                  <div key={sc.id} className="grid grid-cols-12 px-4 py-3 items-center border-b last:border-b-0">
                    <div className="col-span-4">
                      <div className="text-sm text-gray-900">{sc.name}</div>
                      <div className="text-xs text-gray-500">{sc.nameHindi || sc.nameTelugu ? `${sc.nameHindi || ''} ${sc.nameTelugu || ''}` : ''}</div>
                      <div className="text-xs text-gray-500 mt-1">Authorities: {(sc.authorityTypes || []).join(', ') || '-'}</div>
                    </div>
                    <div className="col-span-4 text-sm text-gray-700 line-clamp-2">{sc.description || '-'}</div>
                    <div className="col-span-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sc.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {sc.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center space-x-2 flex-wrap">
                      <button className="text-primary-600 hover:text-primary-900" onClick={() => { setEditingSubcategory(sc); setSubForm({ name: sc.name || '', nameHindi: sc.nameHindi || '', nameTelugu: sc.nameTelugu || '', description: sc.description || '', authorityTypes: sc.authorityTypes || [], isActive: Boolean(sc.isActive) }); }}>Edit</button>
                      <button className="text-gray-600 hover:text-gray-900" onClick={() => toggleSubcategoryActive(sc)} disabled={updateSubMutation.isLoading}>{sc.isActive ? 'Deactivate' : 'Activate'}</button>
                      <button className="text-red-600 hover:text-red-900" onClick={() => deleteSubMutation.mutate(sc.id)} disabled={deleteSubMutation.isLoading}>Delete</button>
                    </div>
                  </div>
                ))}
                {(!activeCategory.Subcategories || activeCategory.Subcategories.length === 0) && (
                  <div className="px-4 py-6 text-sm text-gray-500">No subcategories yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManagement;
