import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { MapPin, Upload, X, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { categoriesAPI, issuesAPI, constituencyAPI } from '../services/api';
import toast from 'react-hot-toast';
import OpenStreetMapPicker from '../components/OpenStreetMapPicker';

const ReportIssueMultiStep = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredAuthorities, setFilteredAuthorities] = useState([]);
  const [locationInput, setLocationInput] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [pincode, setPincode] = useState('');
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  const [mapLocation, setMapLocation] = useState(null);
  const [resetMap, setResetMap] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [mlaInfo, setMlaInfo] = useState(null);
  const [mpInfo, setMpInfo] = useState(null);
  const [isFetchingConstituency, setIsFetchingConstituency] = useState(false);
  const totalSteps = 5;

  // Authority types will be sourced from Subcategory.authorityTypes (DB)
  

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
  const selectedSubcategoryId = watch('subcategoryId');

  // Helper function to get localized name
  const getLocalizedName = (item) => {
    if (language === 'hi' && item.nameHindi) {
      return item.nameHindi;
    } else if (language === 'te' && item.nameTelugu) {
      return item.nameTelugu;
    }
    return item.name;
  };

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

  // Load categories
  const { data: categories, isLoading: categoriesLoading } = useQuery(
    'categories',
    () => categoriesAPI.getCategories().then(r => r.data),
  );

  const categoriesList = Array.isArray(categories) ? categories : (categories && Array.isArray(categories.data) ? categories.data : []);

  // When category changes, set subcategories
  useEffect(() => {
    if (selectedCategoryId && categoriesList.length) {
      const selected = categoriesList.find(c => c.id === selectedCategoryId);
      setSubcategories(selected?.Subcategories || []);
      // reset selected subcategory when category changes
      setValue('subcategoryId', '');
    } else {
      setSubcategories([]);
    }
  }, [selectedCategoryId, categoriesList, setValue]);

  // Filter authority types from selected subcategory (DB-driven)
  useEffect(() => {
    if (!selectedCategoryId || subcategories.length === 0) {
      setFilteredAuthorities([]);
      return;
    }
    const subId = watch('subcategoryId');
    const sc = subcategories.find(s => s.id === subId);
    setFilteredAuthorities(Array.isArray(sc?.authorityTypes) ? sc.authorityTypes : []);
  }, [selectedCategoryId, subcategories, watch('subcategoryId')]);

  // Note: We intentionally do not fetch mapped authorities here.
  // Step 4 collects names for the selected authority levels (authorityTypes) only.

  // Create issue mutation
  const createIssueMutation = useMutation(
    (issueData) => issuesAPI.createIssue(issueData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('issues');
        toast.success('Issue reported successfully!');
        navigate('/dashboard');
      },
      onError: (error) => {
        console.error('Create issue error:', error);
        console.error('Error response:', error.response?.data);
        
        if (error.response?.data?.details) {
          // Show specific validation errors
          const validationErrors = error.response.data.details.map(err => err.msg).join(', ');
          toast.error(`Validation failed: ${validationErrors}`);
        } else {
          toast.error(error.response?.data?.error || 'Failed to create issue');
        }
      }
    }
  );

  const handleLocationSelect = async (location) => {
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

    // Fetch constituency data if we have valid coordinates
    if (location.lat && location.lng) {
      try {
        setIsFetchingConstituency(true);
        console.log('Fetching constituency data for:', location.lat, location.lng);
        
        const constituencyData = await constituencyAPI.findConstituencies(location.lat, location.lng);
        console.log('Constituency data received:', constituencyData);
        
        // Extract MLA info
        if (constituencyData.assembly_constituencies && constituencyData.assembly_constituencies.length > 0) {
          const mla = constituencyData.assembly_constituencies[0];
          const mlaData = {
            name: mla.representative?.name || '',
            party: mla.representative?.party || '',
            constituency: mla.name || '',
            state: mla.state || '',
            role: mla.representative?.role || 'mla'
          };
          setMlaInfo(mlaData);
          console.log('MLA info set:', mlaData);
        } else {
          setMlaInfo(null);
          console.log('No MLA data found');
        }
        
        // Extract MP info
        if (constituencyData.parliament_constituencies && constituencyData.parliament_constituencies.length > 0) {
          const mp = constituencyData.parliament_constituencies[0];
          const mpData = {
            name: mp.representative?.name || '',
            party: mp.representative?.party || '',
            constituency: mp.name || '',
            state: mp.state || '',
            role: mp.representative?.role || 'mp'
          };
          setMpInfo(mpData);
          console.log('MP info set:', mpData);
        } else {
          setMpInfo(null);
          console.log('No MP data found');
        }
        
        toast.success('Constituency data fetched successfully!');
      } catch (error) {
        console.error('Error fetching constituency data:', error);
        setMlaInfo(null);
        setMpInfo(null);
        toast.error('Failed to fetch constituency data. You can still proceed.');
      } finally {
        setIsFetchingConstituency(false);
      }
    } else {
      // Clear MLA/MP data if no valid coordinates
      setMlaInfo(null);
      setMpInfo(null);
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setSelectedFiles(prev => [...prev, {
          file,
          dataUrl,
          name: file.name,
          size: file.size,
          type: file.type
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    if (!selectedLocation) {
      toast.error('Please select a location on the map');
      return;
    }

    // Collect authority information from form fields
    const authorityInfo = {};
    filteredAuthorities.forEach(authorityType => {
      const fieldName = `authority_${authorityType.toLowerCase().replace(/\s+/g, '_')}`;
      const value = data[fieldName];
      if (value) {
        authorityInfo[authorityType] = value;
      }
    });

    const issueData = {
      ...data,
      location: selectedLocation,
      media: selectedFiles.map(file => file.dataUrl),
      authorityInfo: authorityInfo,
      mlaInfo: mlaInfo,
      mpInfo: mpInfo
    };

    
    createIssueMutation.mutate(issueData);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
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
                  }
                })}
                type="text"
                className="input"
                placeholder="Enter a descriptive title for your issue"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Issue Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                {t('issue.description')} <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('description', {
                  required: 'Description is required',
                  minLength: {
                    value: 20,
                    message: 'Description must be at least 20 characters'
                  }
                })}
                rows={4}
                className="input"
                placeholder="Provide detailed information about the issue"
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
                {...register('categoryId', { required: 'Category is required' })}
                className="input"
                disabled={categoriesLoading}
              >
                <option value="">Select a category</option>
                {categoriesList.map((category) => (
                  <option key={category.id} value={category.id}>
                    {getLocalizedName(category)}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
              )}
            </div>

            {/* Subcategory Selection */}
            {subcategories.length > 0 && (
              <div>
                <label htmlFor="subcategoryId" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('issue.subcategory')}
                </label>
                <select
                  {...register('subcategoryId')}
                  className="input"
                >
                  <option value="">Select a subcategory (optional)</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {getLocalizedName(subcategory)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Priority Selection */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                {t('issue.priority')} <span className="text-red-500">*</span>
              </label>
              <select
                {...register('priority', { required: 'Priority is required' })}
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
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Media (Optional)</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add photos or videos to help describe the issue better. This will help officials understand the problem more clearly.
            </p>

            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4 text-center">
                {t('issue.upload_media')}
              </p>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Supported formats: JPG, PNG, GIF, MP4, MOV (Max 10MB per file)
              </p>
            </div>

            {/* File Previews */}
            {selectedFiles.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Uploaded Files:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={file.dataUrl}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-xs text-gray-500">{file.name}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Location</h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose the exact location where this issue is occurring. You can click on the map, enter a pincode, or type the address manually.
            </p>

            {/* Large Map */}
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h3 className="text-sm font-medium text-gray-800">🗺️ Select Location on Map</h3>
                <p className="text-xs text-gray-600">Click anywhere on the map to select your exact location</p>
              </div>
              <div className="h-[600px]">
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

            {/* Location Details */}
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

            {/* Alternative Location Methods */}
            <div className="space-y-4">
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
                    onClick={async () => {
                      if (pincode.length !== 6) {
                        toast.error('Please enter a valid 6-digit pincode');
                        return;
                      }
                      try {
                        setIsFetchingPincode(true);
                        // Use OpenStreetMap Nominatim to geocode the pincode in India
                        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pincode + ' India')}&limit=1`;
                        const res = await fetch(url, {
                          headers: {
                            'Accept': 'application/json'
                          }
                        });
                        if (!res.ok) {
                          throw new Error('Geocoding failed');
                        }
                        const data = await res.json();
                        if (!Array.isArray(data) || data.length === 0) {
                          toast.error('Could not find location for this pincode');
                          return;
                        }
                        const hit = data[0];
                        const lat = parseFloat(hit.lat);
                        const lng = parseFloat(hit.lon);
                        const address = hit.display_name || `Pincode ${pincode}, India`;
                        const location = { lat, lng, address, pincode };
                        handleLocationSelect(location);
                        setLocationInput(address);
                        toast.success('Location set from pincode');
                      } catch (err) {
                        console.error('Pincode lookup error:', err);
                        toast.error('Failed to fetch location for pincode');
                      } finally {
                        setIsFetchingPincode(false);
                      }
                    }}
                    disabled={isFetchingPincode}
                    className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isFetchingPincode ? 'Finding...' : 'Find Location'}
                  </button>
                </div>
              </div>

              {/* Manual Address Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Address Manually
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
                    onClick={() => {
                      if (locationInput.trim()) {
                        const location = {
                          lat: 0,
                          lng: 0,
                          address: locationInput.trim()
                        };
                        handleLocationSelect(location);
                        toast.success('Location set successfully!');
                      }
                    }}
                    className="btn btn-secondary"
                  >
                    Set Location
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Authority Information</h3>
                    <p className="text-sm text-gray-600 mt-1">Know specific officials responsible for this area? Help us reach the right people.</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  Optional
                </span>
              </div>
            </div>

            {/* MLA and MP Information - Always shown if location is selected */}
            {selectedLocation && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <h4 className="text-lg font-medium text-green-800">Constituency Representatives</h4>
                  </div>
                  <p className="text-sm text-green-700 mb-4">
                    Based on your selected location, here are the elected representatives for this area:
                  </p>
                  
                  {/* MLA Information */}
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                        <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold mr-2">MLA</span>
                        Member of Legislative Assembly
                      </h5>
                      {isFetchingConstituency ? (
                        <div className="flex items-center text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          Fetching MLA information...
                        </div>
                      ) : mlaInfo ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                              <input
                                type="text"
                                value={mlaInfo.name}
                                onChange={(e) => setMlaInfo({...mlaInfo, name: e.target.value})}
                                className="w-full input"
                                placeholder="MLA Name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Party</label>
                              <input
                                type="text"
                                value={mlaInfo.party}
                                onChange={(e) => setMlaInfo({...mlaInfo, party: e.target.value})}
                                className="w-full input"
                                placeholder="Political Party"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Constituency</label>
                              <input
                                type="text"
                                value={mlaInfo.constituency}
                                onChange={(e) => setMlaInfo({...mlaInfo, constituency: e.target.value})}
                                className="w-full input"
                                placeholder="Assembly Constituency"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                              <input
                                type="text"
                                value={mlaInfo.state}
                                onChange={(e) => setMlaInfo({...mlaInfo, state: e.target.value})}
                                className="w-full input"
                                placeholder="State"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm">
                          No MLA information available for this location. You can enter details manually:
                          <div className="mt-3 space-y-2">
                            <input
                              type="text"
                              placeholder="MLA Name"
                              className="w-full input"
                              onChange={(e) => setMlaInfo({...mlaInfo, name: e.target.value})}
                            />
                            <input
                              type="text"
                              placeholder="Political Party"
                              className="w-full input"
                              onChange={(e) => setMlaInfo({...mlaInfo, party: e.target.value})}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* MP Information */}
                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                        <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-sm font-bold mr-2">MP</span>
                        Member of Parliament
                      </h5>
                      {isFetchingConstituency ? (
                        <div className="flex items-center text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
                          Fetching MP information...
                        </div>
                      ) : mpInfo ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                              <input
                                type="text"
                                value={mpInfo.name}
                                onChange={(e) => setMpInfo({...mpInfo, name: e.target.value})}
                                className="w-full input"
                                placeholder="MP Name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Party</label>
                              <input
                                type="text"
                                value={mpInfo.party}
                                onChange={(e) => setMpInfo({...mpInfo, party: e.target.value})}
                                className="w-full input"
                                placeholder="Political Party"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Constituency</label>
                              <input
                                type="text"
                                value={mpInfo.constituency}
                                onChange={(e) => setMpInfo({...mpInfo, constituency: e.target.value})}
                                className="w-full input"
                                placeholder="Parliament Constituency"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                              <input
                                type="text"
                                value={mpInfo.state}
                                onChange={(e) => setMpInfo({...mpInfo, state: e.target.value})}
                                className="w-full input"
                                placeholder="State"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm">
                          No MP information available for this location. You can enter details manually:
                          <div className="mt-3 space-y-2">
                            <input
                              type="text"
                              placeholder="MP Name"
                              className="w-full input"
                              onChange={(e) => setMpInfo({...mpInfo, name: e.target.value})}
                            />
                            <input
                              type="text"
                              placeholder="Political Party"
                              className="w-full input"
                              onChange={(e) => setMpInfo({...mpInfo, party: e.target.value})}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Authority Input Fields */}
            {filteredAuthorities.length > 0 ? (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Other Relevant Authorities</h4>
                <p className="text-sm text-gray-600">
                  Based on your selected category and subcategory, please provide the names of other relevant authorities:
                </p>
                <div className="space-y-4">
                  {filteredAuthorities.map((authorityType, index) => (
                    <div key={index} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {authorityType} Name
                      </label>
                      <input
                        type="text"
                        placeholder={`Enter ${authorityType} name`}
                        className="w-full input"
                        {...register(`authority_${authorityType.toLowerCase().replace(/\s+/g, '_')}`)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No specific authorities found for this category/subcategory combination.</p>
                <p className="text-sm text-gray-400">
                  Please select a category and subcategory to see relevant authorities, or you can submit without providing authority information.
                </p>
              </div>
            )}

            {/* We only show inputs for authority levels to capture person names. */}

            {/* Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Providing authority information helps us route your issue to the right people for faster resolution. This information is optional but highly recommended.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Review & Submit</h3>
            <p className="text-sm text-gray-600 mb-6">
              Please review your issue details before submitting. You can go back to make changes if needed.
            </p>

            {/* Issue Summary */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Title:</h4>
                <p className="text-gray-700">{watch('title') || 'Not provided'}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Description:</h4>
                <p className="text-gray-700">{watch('description') || 'Not provided'}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Category:</h4>
                <p className="text-gray-700">
                  {categoriesList.find(cat => cat.id === watch('categoryId')) ? 
                    getLocalizedName(categoriesList.find(cat => cat.id === watch('categoryId'))) : 
                    'Not selected'}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Priority:</h4>
                <p className="text-gray-700 capitalize">{watch('priority') || 'Not selected'}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Location:</h4>
                <p className="text-gray-700">
                  {selectedLocation?.address || 'Not selected'}
                </p>
              </div>
              {/* MLA Information */}
              {mlaInfo && (
                <div>
                  <h4 className="font-medium text-gray-900">MLA Information:</h4>
                  <div className="text-gray-700 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium">Name:</span>
                      <span>{mlaInfo.name || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Party:</span>
                      <span>{mlaInfo.party || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Constituency:</span>
                      <span>{mlaInfo.constituency || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">State:</span>
                      <span>{mlaInfo.state || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* MP Information */}
              {mpInfo && (
                <div>
                  <h4 className="font-medium text-gray-900">MP Information:</h4>
                  <div className="text-gray-700 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium">Name:</span>
                      <span>{mpInfo.name || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Party:</span>
                      <span>{mpInfo.party || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Constituency:</span>
                      <span>{mpInfo.constituency || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">State:</span>
                      <span>{mpInfo.state || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-900">Other Authority Information:</h4>
                <div className="text-gray-700">
                  {filteredAuthorities.length > 0 ? (
                    <div className="space-y-2">
                      {filteredAuthorities.map((authorityType, index) => {
                        const fieldName = `authority_${authorityType.toLowerCase().replace(/\s+/g, '_')}`;
                        const value = watch(fieldName);
                        return (
                          <div key={index} className="flex justify-between">
                            <span className="font-medium">{authorityType}:</span>
                            <span>{value || 'Not provided'}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p>No other authorities specified for this category/subcategory</p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Media Files:</h4>
                <p className="text-gray-700">
                  {selectedFiles.length} file(s) uploaded
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Anonymous:</h4>
                <p className="text-gray-700">
                  {watch('isAnonymous') ? 'Yes' : 'No'}
                </p>
              </div>
            </div>

            {!selectedLocation && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">
                  ⚠️ Please select a location before submitting the issue.
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
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
            {[1, 2, 3, 4, 5].map((step) => (
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
                {step < 5 && (
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
            <span>Authority</span>
            <span>Review & Submit</span>
          </div>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
        }} className="space-y-8">
          {/* Step Content */}
          <div className="bg-white rounded-lg shadow p-6">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="btn btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn btn-primary flex items-center"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit(onSubmit)()}
                disabled={!selectedLocation || isSubmitting}
                className="btn btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Issue'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportIssueMultiStep;
