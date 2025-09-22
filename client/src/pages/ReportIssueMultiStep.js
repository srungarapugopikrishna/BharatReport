import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { MapPin, Upload, X, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { categoriesAPI, issuesAPI } from '../services/api';
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
  const totalSteps = 5;

  // Authority mapping based on category and subcategory
  // Maps to actual authority levels and designations in the database
  const authorityMapping = {
    "Roads & Transport": {
      "Potholes": ["Corporator", "Municipal Engineer", "Contractor", "MLA", "MP"],
      "Broken Footpaths": ["Corporator", "Municipal Engineer", "Contractor"],
      "Streetlights not working": ["Corporator", "Municipal Engineer", "Electricity Department"],
      "Encroachment": ["Corporator", "Municipal Commissioner", "Town Planning Officer"],
      "Illegal Parking": ["Traffic Police", "Corporator"],
      "Missing Signboards": ["Municipal Engineer", "Traffic Department"],
      "Wrong Speed Breakers": ["Corporator", "Municipal Engineer"]
    },
    "Traffic & Safety": {
      "Traffic Signal Not Working": ["Traffic Police", "Municipal Engineer"],
      "Dangerous Intersections": ["Traffic Police", "Corporator", "Urban Planning Department"],
      "Missing Pedestrian Crossings": ["Traffic Police", "Urban Planning Department"],
      "Illegal Auto/Taxi Stands": ["Traffic Police", "RTO", "Corporator"]
    },
    "Water Supply & Drainage": {
      "No Water Supply": ["Water Board Engineer", "Corporator", "MLA"],
      "Leakage": ["Water Board Engineer", "Corporator"],
      "Contaminated Water": ["Water Board", "Public Health Department"],
      "Open Drains": ["Corporator", "Municipal Engineer"],
      "Blocked Sewage": ["Corporator", "Sewage Board"]
    },
    "Electricity & Power": {
      "Power Cuts": ["Electricity Board", "MLA"],
      "Unsafe Electrical Poles/Wires": ["Electricity Board Engineer", "Corporator"],
      "Faulty Transformers": ["Electricity Board", "Engineer"],
      "No Streetlights": ["Corporator", "Electricity Board"]
    },
    "Sanitation & Waste": {
      "Garbage Not Collected": ["Corporator", "Sanitation Supervisor", "Municipal Commissioner"],
      "Overflowing Bins": ["Sanitation Department", "Corporator"],
      "Open Dumping": ["Sanitation Department", "Municipal Commissioner"],
      "Public Toilet Maintenance": ["Municipal Engineer", "Health Department"]
    },
    "Environment": {
      "Tree Cutting": ["Forest Department", "Municipal Commissioner"],
      "Air Pollution": ["Pollution Control Board", "Municipal Commissioner"],
      "Water Pollution": ["Pollution Control Board", "Water Board"],
      "Illegal Construction Near Lakes": ["Urban Development Authority", "Municipal Commissioner"]
    },
    "Health & Safety": {
      "Dengue Breeding Spots": ["Health Department", "Corporator"],
      "Lack of Fogging": ["Municipal Health Officer"],
      "Lack of Ambulances": ["Health Department", "Hospital Authority"],
      "Hospital Negligence": ["Hospital Authority", "Health Department"]
    },
    "Law & Order": {
      "Eve-teasing Hotspots": ["Local Police Station", "Women Safety Cell"],
      "Illegal Alcohol Outlets": ["Excise Department", "Police"],
      "Public Nuisance": ["Police", "Corporator"]
    },
    "Education": {
      "Broken Infrastructure in Government Schools": ["School Management", "Education Department"],
      "Lack of Teachers": ["Education Department", "MLA"]
    },
    "Public Transport": {
      "Poor Bus Frequency": ["Transport Corporation", "MLA"],
      "Damaged Bus Shelters": ["Corporator", "Transport Department"],
      "Unsafe Metro Stations": ["Metro Rail Authority", "Safety Cell"]
    },
    "Welfare & Governance": {
      "Pension Delays": ["Social Welfare Department"],
      "Ration Card Issues": ["Civil Supplies Department"],
      "Aadhaar Errors": ["UIDAI Center", "District Administration"],
      "Corruption": ["Anti-Corruption Bureau", "Lokayukta"]
    },
    "Miscellaneous": {
      "Stray Dogs/Cattle": ["Municipal Veterinary Department"],
      "Fire Hazards": ["Fire Department", "Municipal Commissioner"],
      "Public Encroachments": ["Town Planning Department", "Corporator"]
    }
  };
  

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
    if (selectedCategoryId && categories) {
      const category = categories.find(cat => cat.id === selectedCategoryId);
      if (category && category.Subcategories) {
        setSubcategories(category.Subcategories);
        setValue('subcategoryId', ''); // Reset subcategory when category changes
      }
    } else {
      setSubcategories([]);
    }
  }, [selectedCategoryId, categories, setValue]);

  // Function to get relevant authorities based on category and subcategory
  const getRelevantAuthorities = (categoryName, subcategoryName) => {
    console.log('getRelevantAuthorities called with:', { categoryName, subcategoryName });
    
    if (!categoryName || !subcategoryName) {
      console.log('Missing category or subcategory name');
      return [];
    }
    
    const categoryMapping = authorityMapping[categoryName];
    console.log('Category mapping found:', categoryMapping);
    
    if (!categoryMapping) {
      console.log('No mapping found for category:', categoryName);
      return [];
    }
    
    const authorityNames = categoryMapping[subcategoryName];
    console.log('Authority names for subcategory:', authorityNames);
    
    if (!authorityNames) {
      console.log('No authority names found for subcategory:', subcategoryName);
      return [];
    }
    
    console.log('Returning authority names:', authorityNames);
    return authorityNames;
  };


  // Filter authorities based on selected category and subcategory
  useEffect(() => {
    if (selectedCategoryId && subcategories.length > 0) {
      const selectedCategory = categories?.find(cat => cat.id === selectedCategoryId);
      const selectedSubcategoryId = watch('subcategoryId');
      const selectedSubcategory = subcategories.find(sub => sub.id === selectedSubcategoryId);
      
      console.log('Filtering authorities:', {
        selectedCategory: selectedCategory?.name,
        selectedSubcategory: selectedSubcategory?.name,
        categoryId: selectedCategoryId,
        subcategoryId: selectedSubcategoryId
      });
      
      if (selectedCategory && selectedSubcategory) {
        const relevantAuthorityTypes = getRelevantAuthorities(
          getLocalizedName(selectedCategory), 
          getLocalizedName(selectedSubcategory)
        );
        
        console.log('Relevant authority types:', relevantAuthorityTypes);
        
        setFilteredAuthorities(relevantAuthorityTypes);
      } else {
        setFilteredAuthorities([]);
      }
    } else {
      setFilteredAuthorities([]);
    }
  }, [selectedCategoryId, subcategories, watch('subcategoryId'), categories]);

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
      authorityInfo: authorityInfo
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
                {categories?.map((category) => (
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
                    onClick={() => {
                      // Add pincode functionality here
                      toast.info('Pincode functionality coming soon!');
                    }}
                    className="btn btn-primary"
                  >
                    Find Location
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

            {/* Dynamic Authority Input Fields */}
            {filteredAuthorities.length > 0 ? (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Relevant Authorities</h4>
                <p className="text-sm text-gray-600">
                  Based on your selected category and subcategory, please provide the names of the relevant authorities:
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
                  {categories?.find(cat => cat.id === watch('categoryId')) ? 
                    getLocalizedName(categories.find(cat => cat.id === watch('categoryId'))) : 
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
              <div>
                <h4 className="font-medium text-gray-900">Authority Information:</h4>
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
                    <p>No authorities specified for this category/subcategory</p>
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
