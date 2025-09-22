import React, { useState, useCallback, useRef } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { MapPin, X } from 'lucide-react';
import FallbackMapPicker from './FallbackMapPicker';
import SimpleMapTest from './SimpleMapTest';

const MapComponent = ({ onLocationSelect, onClose }) => {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const mapRef = useRef(null);

  const onLoad = useCallback((map) => {
    setMap(map);
    
    // Set initial center to India
    map.setCenter({ lat: 20.5937, lng: 78.9629 });
    map.setZoom(6);
    
    // Add click listener
    map.addListener('click', (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      // Remove existing marker
      if (marker) {
        marker.setMap(null);
      }
      
      // Add new marker
      const newMarker = new window.google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: 'Selected Location'
      });
      
      setMarker(newMarker);
      setSelectedLocation({ lat, lng });
    });
  }, [marker]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleConfirmLocation = async () => {
    if (!selectedLocation) {
      alert('Please select a location on the map');
      return;
    }

    setIsReverseGeocoding(true);
    
    try {
      // Use Google Geocoding API
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ location: selectedLocation }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const result = results[0];
          const addressComponents = result.address_components;
          
          // Extract address components
          let streetNumber = '';
          let route = '';
          let locality = '';
          let administrativeAreaLevel2 = ''; // District
          let administrativeAreaLevel1 = ''; // State
          let postalCode = '';
          let country = '';
          
          addressComponents.forEach(component => {
            const types = component.types;
            if (types.includes('street_number')) {
              streetNumber = component.long_name;
            } else if (types.includes('route')) {
              route = component.long_name;
            } else if (types.includes('locality')) {
              locality = component.long_name;
            } else if (types.includes('administrative_area_level_2')) {
              administrativeAreaLevel2 = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
              administrativeAreaLevel1 = component.long_name;
            } else if (types.includes('postal_code')) {
              postalCode = component.long_name;
            } else if (types.includes('country')) {
              country = component.long_name;
            }
          });
          
          // Build formatted address
          const addressParts = [];
          if (streetNumber) addressParts.push(streetNumber);
          if (route) addressParts.push(route);
          if (locality) addressParts.push(locality);
          if (administrativeAreaLevel2) addressParts.push(administrativeAreaLevel2);
          if (administrativeAreaLevel1) addressParts.push(administrativeAreaLevel1);
          if (postalCode) addressParts.push(postalCode);
          if (country) addressParts.push(country);
          
          const formattedAddress = addressParts.join(', ');
          
          const locationData = {
            lat: selectedLocation.lat,
            lng: selectedLocation.lng,
            address: formattedAddress,
            pincode: postalCode,
            district: administrativeAreaLevel2,
            state: administrativeAreaLevel1,
            city: locality,
            country: country
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
        
        setIsReverseGeocoding(false);
      });
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
      setIsReverseGeocoding(false);
    }
  };

  return (
    <div className="w-full h-96 relative">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      {selectedLocation && (
        <div className="absolute bottom-4 left-4 right-4 bg-white p-3 rounded-lg shadow-lg border">
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
                onClick={handleConfirmLocation}
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

const GoogleMapPicker = ({ onLocationSelect, onClose }) => {
  const render = (status) => {
    switch (status) {
      case Status.LOADING:
        return (
          <div className="w-full h-96 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading Google Maps...</p>
            </div>
          </div>
        );
      case Status.FAILURE:
        return (
          <div className="w-full h-96 flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
            <div className="text-center">
              <X className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600">Failed to load Google Maps</p>
              <p className="text-sm text-red-500 mt-1">Please check your internet connection</p>
            </div>
          </div>
        );
      default:
        return (
          <MapComponent 
            onLocationSelect={onLocationSelect} 
            onClose={onClose}
          />
        );
    }
  };

  // For demo purposes, we'll use a fallback if no API key is provided
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  
  // Use fallback map (works without API key)
  console.log('GoogleMapPicker: Using fallback map, API key:', apiKey);
  return <FallbackMapPicker onLocationSelect={onLocationSelect} onClose={onClose} />;

  return (
    <Wrapper 
      apiKey={apiKey} 
      render={render}
      libraries={['places', 'geocoding']}
    />
  );
};

export default GoogleMapPicker;
