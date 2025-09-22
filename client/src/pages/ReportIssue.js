import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { MapPin, Upload, X, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { categoriesAPI, issuesAPI } from '../services/api';
import toast from 'react-hot-toast';
import OpenStreetMapPicker from '../components/OpenStreetMapPicker';

const ReportIssue = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [locationInput, setLocationInput] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [pincode, setPincode] = useState('');
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  const [mapLocation, setMapLocation] = useState(null);
  const [resetMap, setResetMap] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      categoryId: '',
      subcategoryId: '',
      priority: 'medium',
      isAnonymous: false
    }
  });

  const selectedCategoryId = watch('categoryId');

  // Step navigation functions
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery(
    'categories',
    () => categoriesAPI.getCategories(),
    {
      select: (response) => response.data
    }
  );

  // Fetch subcategories when category changes
  useEffect(() => {
    if (selectedCategoryId) {
      categoriesAPI.getSubcategories(selectedCategoryId)
        .then(response => {
          setSubcategories(response.data);
          setValue('subcategoryId', ''); // Reset subcategory selection
        })
        .catch(error => {
          console.error('Error fetching subcategories:', error);
        });
    } else {
      setSubcategories([]);
    }
  }, [selectedCategoryId, setValue]);

  // Create issue mutation
  const createIssueMutation = useMutation(
    (issueData) => issuesAPI.createIssue(issueData),
    {
      onSuccess: (response) => {
        toast.success('Issue reported successfully!');
        queryClient.invalidateQueries('recentIssues');
        queryClient.invalidateQueries('myIssues');
        navigate(`/issues/${response.data.id}`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to report issue');
      }
    }
  );

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
              const dataUrl = e.target.result;
              console.log(`FileReader result for ${file.name}:`, dataUrl.substring(0, 100) + '...');
              resolve({
                name: file.name,
                type: file.type,
                size: file.size,
                dataUrl: dataUrl
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

  const handleLocationSelect = (location) => {
    console.log('handleLocationSelect called with:', location);
    console.log('Previous selectedLocation:', selectedLocation);
    console.log('Setting selectedLocation to:', location);
    setSelectedLocation(location);
    
    // Log detailed location information
    if (location.address) {
      console.log('Address:', location.address);
    }
    if (location.street) {
      console.log('Street:', location.street);
    }
    if (location.area) {
      console.log('Area:', location.area);
    }
    if (location.city) {
      console.log('City:', location.city);
    }
    if (location.district) {
      console.log('District:', location.district);
    }
    if (location.state) {
      console.log('State:', location.state);
    }
    if (location.pincode) {
      console.log('Pincode:', location.pincode);
    }
    console.log('Coordinates:', location.lat, location.lng);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocoding to get address
        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
          .then(response => response.json())
          .then(data => {
            const address = `${data.locality || data.city || 'Unknown'}, ${data.principalSubdivision || data.state || 'Unknown'}, ${data.countryName || 'Unknown'}`;
            const location = {
              lat: latitude,
              lng: longitude,
              address: address
            };
            handleLocationSelect(location);
            setLocationInput(address);
            setIsGettingLocation(false);
            toast.success('Location detected successfully!');
          })
          .catch(error => {
            console.error('Error getting address:', error);
            // Fallback to coordinates if reverse geocoding fails
            const location = {
              lat: latitude,
              lng: longitude,
              address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            };
            handleLocationSelect(location);
            setLocationInput(location.address);
            setIsGettingLocation(false);
            toast.success('Location detected (coordinates only)');
          });
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsGettingLocation(false);
        toast.error('Unable to get your location. Please enter manually.');
      }
    );
  };

  const handleManualLocationSubmit = () => {
    if (!locationInput.trim()) {
      toast.error('Please enter a location');
      return;
    }

    // For manual input, we'll use a default location with the entered address
    const location = {
      lat: 0, // Will be filled by geocoding if needed
      lng: 0, // Will be filled by geocoding if needed
      address: locationInput.trim()
    };
    handleLocationSelect(location);
    toast.success('Location set successfully!');
  };

  const fetchLocationFromPincode = async () => {
    if (!pincode.trim()) {
      toast.error('Please enter a pincode');
      return;
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    setIsFetchingPincode(true);
    
    try {
      // Using India Post API for pincode lookup
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode.trim()}`);
      const data = await response.json();
      
      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice) {
        const postOffice = data[0].PostOffice[0];
        const address = `${postOffice.Name}, ${postOffice.District}, ${postOffice.State} ${postOffice.Pincode}, India`;
        
        const location = {
          lat: parseFloat(postOffice.Latitude) || 0,
          lng: parseFloat(postOffice.Longitude) || 0,
          address: address,
          pincode: postOffice.Pincode,
          district: postOffice.District,
          state: postOffice.State
        };
        
        handleLocationSelect(location);
        setLocationInput(address);
        toast.success(`Location found for pincode ${pincode}`);
      } else {
        toast.error('Pincode not found. Please check and try again.');
      }
    } catch (error) {
      console.error('Error fetching pincode data:', error);
      toast.error('Failed to fetch location. Please try again.');
    } finally {
      setIsFetchingPincode(false);
    }
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

    // Debug: log what's being sent
    console.log('Sending issue data:', issueData);
    console.log('Location data being sent:', selectedLocation);
    console.log('Media data being sent:', issueData.media);
    if (issueData.media) {
      issueData.media.forEach((media, index) => {
        console.log(`Sending media ${index}:`, media, 'Type:', typeof media, 'Length:', media?.length);
      });
    }

    createIssueMutation.mutate(issueData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Report an Issue</h1>
          <p className="text-gray-600 mt-2">
            Help improve your community by reporting civic issues that need attention.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <button
                  type="button"
                  onClick={() => goToStep(step)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </button>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Issue Details</span>
            <span>Media Upload</span>
            <span>Location</span>
            <span>Review & Submit</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Step 1: Issue Details */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Step 1: Issue Details</h2>
              <div className="space-y-6">
                {/* Issue Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('issue.title')} <span className="text-red-500">*</span>
                  </label>
                <input
                  {...register('title', {
                    required: 'Title is required',
                    minLength: {
                      value: 5,
                      message: 'Title must be at least 5 characters'
                    },
                    maxLength: {
                      value: 200,
                      message: 'Title must be less than 200 characters'
                    }
                  })}
                  type="text"
                  className={`input ${errors.title ? 'border-red-300' : ''}`}
                  placeholder="Brief description of the issue"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('issue.description')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('description', {
                    required: 'Description is required',
                    minLength: {
                      value: 10,
                      message: 'Description must be at least 10 characters'
                    },
                    maxLength: {
                      value: 2000,
                      message: 'Description must be less than 2000 characters'
                    }
                  })}
                  rows={4}
                  className={`input ${errors.description ? 'border-red-300' : ''}`}
                  placeholder="Provide detailed information about the issue..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Category Selection */}
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('issue.category')} <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('categoryId', {
                    required: 'Please select a category'
                  })}
                  className={`input ${errors.categoryId ? 'border-red-300' : ''}`}
                >
                  <option value="">{t('issue.select_category')}</option>
                  {categoriesLoading ? (
                    <option disabled>Loading categories...</option>
                  ) : (
                    categories?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  )}
                </select>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
                )}
              </div>

              {/* Subcategory Selection */}
              <div>
                <label htmlFor="subcategoryId" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('issue.subcategory')} <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('subcategoryId', {
                    required: 'Please select a subcategory'
                  })}
                  className={`input ${errors.subcategoryId ? 'border-red-300' : ''}`}
                  disabled={!selectedCategoryId}
                >
                  <option value="">{t('issue.select_subcategory')}</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
                {errors.subcategoryId && (
                  <p className="mt-1 text-sm text-red-600">{errors.subcategoryId.message}</p>
                )}
              </div>

              {/* Priority Selection */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('issue.priority')}
                </label>
                <select
                  {...register('priority')}
                  className="input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Anonymous Reporting */}
              <div className="flex items-center">
                <input
                  {...register('isAnonymous')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  {t('auth.anonymous')}
                </label>
              </div>
            </div>

            {/* Right Column - Location and Media */}
            <div className="space-y-6">
              {/* Location Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('issue.location')} <span className="text-red-500">*</span>
                </label>
                
                <div className="space-y-4">
                  {/* Inline Map - Always Visible */}
                  <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b">
                      <h3 className="text-sm font-medium text-gray-800">🗺️ Select Location on Map</h3>
                      <p className="text-xs text-gray-600">Click anywhere on the map to select your exact location</p>
                    </div>
                    <div className="h-[500px] md:h-[600px]">
                      <OpenStreetMapPicker 
                        onLocationSelect={(locationData) => {
                          console.log('ReportIssue received location data:', locationData);
                          console.log('Address in location data:', locationData.address);
                          handleLocationSelect(locationData);
                          setLocationInput(locationData.address);
                          toast.success('Location selected successfully!');
                        }}
                        onClose={() => {
                          // No need to close since it's inline
                        }}
                        resetMap={resetMap}
                        onReset={() => {
                          console.log('Map reset completed');
                          setResetMap(false);
                        }}
                      />
                    </div>
                  </div>

                  {/* Location Details - Show when location is selected */}
                  {console.log('Rendering location section, selectedLocation:', selectedLocation)}
                  {selectedLocation && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                          <div>
                            <p className="font-medium text-green-800">{t('issue.location_selected_title')}</p>
                            <p className="text-green-600 text-sm">{selectedLocation.address || 'Loading address...'}</p>
                            <p className="text-green-500 text-xs mt-1">
                              Coordinates: {selectedLocation.lat?.toFixed(6)}, {selectedLocation.lng?.toFixed(6)}
                            </p>
                            {console.log('Displaying address:', selectedLocation.address)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            console.log('Change location clicked');
                            setSelectedLocation(null);
                            setLocationInput('');
                            setResetMap(true);
                          }}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  )}

                    {/* OR Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">OR</span>
                      </div>
                    </div>

                    {/* Pincode Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter Pincode (India)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="e.g., 110001"
                          className="flex-1 input"
                          maxLength="6"
                        />
                        <button
                          type="button"
                          onClick={fetchLocationFromPincode}
                          disabled={isFetchingPincode}
                          className="btn btn-primary"
                        >
                          {isFetchingPincode ? 'Finding...' : 'Find Location'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Enter 6-digit Indian pincode to auto-fetch location details
                      </p>
                    </div>

                    {/* OR Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">OR</span>
                      </div>
                    </div>

                    {/* Manual Location Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter Location Manually
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={locationInput}
                          onChange={(e) => setLocationInput(e.target.value)}
                          placeholder="e.g., Mumbai, Maharashtra, India"
                          className="flex-1 input"
                        />
                        <button
                          type="button"
                          onClick={handleManualLocationSubmit}
                          className="btn btn-secondary"
                        >
                          Set Location
                        </button>
                      </div>
                    </div>

                    {/* OR Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">OR</span>
                      </div>
                    </div>

                    {/* Current Location Button */}
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={isGettingLocation}
                        className="btn btn-primary flex items-center justify-center mx-auto"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        {isGettingLocation ? 'Getting Location...' : 'Use Current Location'}
                      </button>
                      <p className="text-xs text-gray-500 mt-2">
                        Allow location access to automatically detect your current location
                      </p>
                    </div>
                  </div>

                {!selectedLocation && (
                  <p className="mt-2 text-sm text-red-600">{t('issue.please_select_location')}</p>
                )}
              </div>

              {/* Media Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('issue.media')}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    {t('issue.upload_media')}
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="media-upload"
                  />
                  <label
                    htmlFor="media-upload"
                    className="btn btn-secondary cursor-pointer"
                  >
                    {t('issue.choose_files')}
                  </label>
                </div>

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">{t('issue.selected_files')}:</p>
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
                              {(file.size / 1024 / 1024).toFixed(2)} MB
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
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || createIssueMutation.isLoading}
              className="btn btn-primary"
            >
              {isSubmitting || createIssueMutation.isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : null}
              {t('issue.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportIssue;
