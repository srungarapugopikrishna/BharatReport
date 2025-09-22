import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { MapPin, Upload, X, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { issuesAPI, categoriesAPI } from '../services/api';
import toast from 'react-hot-toast';

const EditIssue = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [subcategories, setSubcategories] = useState([]);

  const { register, handleSubmit, formState: { errors }, setValue, watch, control } = useForm({
    defaultValues: {
      title: '',
      description: '',
      categoryId: '',
      subcategoryId: '',
      priority: 'medium'
    }
  });

  // Fetch issue details
  const { data: issue, isLoading: issueLoading } = useQuery(
    ['issue', id],
    () => issuesAPI.getIssue(id),
    {
      select: (response) => response.data
    }
  );

  // Set form values when issue data is loaded
  useEffect(() => {
    if (issue) {
      setValue('title', issue.title || '');
      setValue('description', issue.description || '');
      setValue('categoryId', issue.categoryId || '');
      setValue('subcategoryId', issue.subcategoryId || '');
      setValue('priority', issue.priority || 'medium');
      setSelectedLocation(issue.location);
      if (issue.media) {
        setSelectedFiles(issue.media.map((media, index) => ({
          name: `existing_${index}`,
          type: 'image/jpeg',
          size: 0,
          dataUrl: media
        })));
      }
    }
  }, [issue, setValue]);

  // Fetch categories
  const { data: categories } = useQuery(
    'categories',
    () => categoriesAPI.getCategories(),
    {
      select: (response) => response.data
    }
  );
  const selectedCategoryId = watch('categoryId');

  // Fetch subcategories when category changes
  useEffect(() => {
    if (selectedCategoryId) {
      categoriesAPI.getSubcategories(selectedCategoryId)
        .then(response => {
          setSubcategories(response.data);
        })
        .catch(error => {
          console.error('Error fetching subcategories:', error);
        });
    } else {
      setSubcategories([]);
    }
  }, [selectedCategoryId]);

  // Update issue mutation
  const updateIssueMutation = useMutation(
    (data) => issuesAPI.updateIssue(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['issue', id]);
        queryClient.invalidateQueries('issues');
        toast.success('Issue updated successfully!');
        navigate(`/issues/${id}`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update issue');
      }
    }
  );

  // Load Google Maps
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (mapLoaded && selectedLocation) {
      const map = new window.google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: { lat: selectedLocation.lat, lng: selectedLocation.lng }
      });

      const marker = new window.google.maps.Marker({
        position: { lat: selectedLocation.lat, lng: selectedLocation.lng },
        map: map,
        draggable: true
      });

      marker.addListener('dragend', () => {
        const position = marker.getPosition();
        setSelectedLocation({
          lat: position.lat(),
          lng: position.lng(),
          address: selectedLocation.address // Keep existing address
        });
      });

      map.addListener('click', (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        // Reverse geocoding
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results[0]) {
            setSelectedLocation({
              lat,
              lng,
              address: results[0].formatted_address
            });
            marker.setPosition({ lat, lng });
          }
        });
      });
    }
  }, [mapLoaded, selectedLocation]);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit

      if (!isValidType) {
        toast.error('Please select only image or video files');
        return false;
      }
      if (!isValidSize) {
        toast.error('File size must be less than 10MB');
        return false;
      }
      return true;
      });

    // Convert files to data URLs for preview and storage
    const processFiles = async () => {
      const processedFiles = await Promise.all(
        validFiles.map(file => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve({
                name: file.name,
                type: file.type,
                size: file.size,
                dataUrl: e.target.result
              });
            };
            reader.readAsDataURL(file);
          });
        })
      );
      setSelectedFiles(prev => [...prev, ...processedFiles]);
    };

    processFiles();
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    if (!selectedLocation) {
      toast.error('Please select a location on the map');
      return;
    }

    const issueData = {
      ...data,
      location: selectedLocation,
      media: selectedFiles.map(file => file.dataUrl) // Use data URLs for now
    };

    updateIssueMutation.mutate(issueData);
  };

  if (issueLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading issue...</p>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Issue Not Found</h1>
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/issues/${id}`)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Issue
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Issue</h1>
          <p className="text-gray-600 mt-2">Update your issue details</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Issue Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Title *
                </label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Brief description of the issue"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Detailed description of the issue"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  {...register('categoryId', { required: 'Category is required' })}
                  value={watch('categoryId') || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a category</option>
                  {categories && categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
                )}
              </div>

              {/* Subcategory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory
                </label>
                <select
                  {...register('subcategoryId')}
                  value={watch('subcategoryId') || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={!selectedCategoryId}
                >
                  <option value="">Select a subcategory</option>
                  {subcategories && subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  {...register('priority')}
                  value={watch('priority') || 'medium'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Location</h2>
            
            {selectedLocation && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm text-green-800">{selectedLocation.address}</span>
                </div>
              </div>
            )}

            <div className="h-64 bg-gray-100 rounded-lg overflow-hidden">
              <div id="map" className="w-full h-full"></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Click on the map to select or update the issue location
            </p>
          </div>

          {/* Media Upload */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Media Attachments</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-4">Upload photos or videos of the issue</p>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="btn btn-primary cursor-pointer"
              >
                Choose Files
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Max 10MB per file. Images and videos only.
              </p>
            </div>

            {/* File Preview */}
            {selectedFiles.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Selected Files:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative bg-gray-50 rounded-lg overflow-hidden">
                      {file.type.startsWith('image/') && file.dataUrl ? (
                        <div className="aspect-square">
                          <img
                            src={file.dataUrl}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square flex items-center justify-center">
                          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                            <span className="text-primary-600 text-xs">VID</span>
                          </div>
                        </div>
                      )}
                      <div className="p-2">
                        <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {file.size > 0 ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Existing file'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/issues/${id}`)}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateIssueMutation.isLoading}
              className="btn btn-primary disabled:opacity-50"
            >
              {updateIssueMutation.isLoading ? 'Updating...' : 'Update Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditIssue;
