import React, { useState } from 'react';
import { MapPin, X } from 'lucide-react';

const FallbackMapPicker = ({ onLocationSelect, onClose }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  
  console.log('FallbackMapPicker: Component rendered');

  const handleMapClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert click coordinates to approximate lat/lng for India
    const lat = 20.5937 + (0.5 - y / rect.height) * 15; // India latitude range
    const lng = 78.9629 + (x / rect.width - 0.5) * 25; // India longitude range
    
    setSelectedLocation({ lat, lng });
  };

  const confirmLocation = async () => {
    if (!selectedLocation) {
      alert('Please select a location on the map');
      return;
    }

    setIsReverseGeocoding(true);
    
    try {
      // Use a free geocoding service as fallback
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${selectedLocation.lat}&longitude=${selectedLocation.lng}&localityLanguage=en`
      );
      const data = await response.json();
      
      if (data && data.locality) {
        const address = `${data.locality || data.city || 'Unknown'}, ${data.principalSubdivision || data.state || 'Unknown'}, ${data.countryName || 'India'}`;
        
        const locationData = {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          address: address,
          pincode: data.postcode || '',
          district: data.principalSubdivision || data.state || '',
          state: data.principalSubdivision || data.state || '',
          city: data.locality || data.city || '',
          country: data.countryName || 'India'
        };
        
        onLocationSelect(locationData);
      } else {
        // Fallback to coordinates if geocoding fails
        const locationData = {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          address: `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`,
          pincode: '',
          district: '',
          state: '',
          city: '',
          country: ''
        };
        
        onLocationSelect(locationData);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      // Fallback to coordinates
      const locationData = {
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        address: `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`,
        pincode: '',
        district: '',
        state: '',
        city: '',
        country: ''
      };
      
      onLocationSelect(locationData);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  return (
    <div className="w-full h-96 relative">
      {/* Interactive Map Area */}
      <div 
        className="w-full h-full bg-gradient-to-br from-green-200 to-blue-200 border-2 border-gray-400 rounded-lg cursor-pointer"
        onClick={handleMapClick}
      >
        {/* Map Grid - Simplified */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-8 grid-rows-6 h-full">
            {Array.from({ length: 48 }).map((_, i) => (
              <div key={i} className="border border-gray-300"></div>
            ))}
          </div>
        </div>
        
        {/* Map Labels */}
        <div className="absolute top-2 left-2 text-xs text-gray-700">
          <div className="bg-white bg-opacity-90 px-2 py-1 rounded">North India</div>
        </div>
        <div className="absolute bottom-2 right-2 text-xs text-gray-700">
          <div className="bg-white bg-opacity-90 px-2 py-1 rounded">South India</div>
        </div>
        
        {/* Major Cities */}
        <div className="absolute top-1/4 left-1/3 text-xs text-gray-600">
          <div className="bg-white bg-opacity-80 px-2 py-1 rounded">Delhi</div>
        </div>
        <div className="absolute top-1/2 left-1/4 text-xs text-gray-600">
          <div className="bg-white bg-opacity-80 px-2 py-1 rounded">Mumbai</div>
        </div>
        <div className="absolute bottom-1/3 right-1/3 text-xs text-gray-600">
          <div className="bg-white bg-opacity-80 px-2 py-1 rounded">Bangalore</div>
        </div>
        <div className="absolute bottom-1/4 right-1/4 text-xs text-gray-600">
          <div className="bg-white bg-opacity-80 px-2 py-1 rounded">Chennai</div>
        </div>
        
        {/* Selected Location Marker */}
        {selectedLocation && (
          <div 
            className="absolute w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg transform -translate-x-3 -translate-y-3"
            style={{
              left: `${((selectedLocation.lng - 66.9629) / 25 + 0.5) * 100}%`,
              top: `${((35.5937 - selectedLocation.lat) / 15 + 0.5) * 100}%`
            }}
          >
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
              {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
            </div>
          </div>
        )}
        
        {/* Click Instructions */}
        {!selectedLocation && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white bg-opacity-95 px-6 py-4 rounded-lg shadow-lg border">
              <div className="text-center">
                <div className="text-2xl mb-2">🗺️</div>
                <p className="text-sm font-medium text-gray-700 mb-1">Click anywhere to select location</p>
                <p className="text-xs text-gray-500">Interactive map with major Indian cities</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Location Info and Controls */}
      {selectedLocation && (
        <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">Selected Location:</p>
              <p className="text-xs text-gray-600">
                {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmLocation}
                disabled={isReverseGeocoding}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isReverseGeocoding ? 'Getting Address...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FallbackMapPicker;
