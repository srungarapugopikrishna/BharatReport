import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapEvents = ({ onLocationSelect, selectedLocation }) => {
  useMapEvents({
    click: (e) => {
      console.log('Map clicked at:', e.latlng);
      const { lat, lng } = e.latlng;
      onLocationSelect({ lat, lng });
    },
  });
  return null;
};

const OpenStreetMapPicker = ({ onLocationSelect, onClose, resetMap, onReset }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [address, setAddress] = useState('');

  // Reset map when resetMap prop changes
  React.useEffect(() => {
    if (resetMap) {
      console.log('Resetting map state');
      setSelectedLocation(null);
      setAddress('');
      setIsReverseGeocoding(false);
      if (onReset) {
        onReset();
      }
    }
  }, [resetMap, onReset]);

  // Default center for India
  const center = [20.5937, 78.9629];
  const zoom = 10;

  const handleLocationSelect = async (location) => {
    console.log('Location selected in OpenStreetMapPicker:', location);
    setSelectedLocation(location);
    setAddress(''); // Clear previous address
    
    // Immediately try to get address for display
    getAddressForLocation(location);
    
    // Run address resolution immediately with timeout
    try {
      console.log('Running immediate address resolution for:', location);
      const addressPromise = confirmLocation(location);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Address resolution timeout')), 5000)
      );
      
      await Promise.race([addressPromise, timeoutPromise]);
    } catch (error) {
      console.error('Error in immediate address resolution:', error);
      // Fallback to coordinates if address resolution fails
      const locationData = {
        lat: location.lat,
        lng: location.lng,
        address: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
        pincode: '',
        district: '',
        state: '',
        street: '',
        area: '',
        city: '',
        country: 'India',
        ward: '',
        municipality: '',
        zone: '',
        mandal: '',
        village: '',
        hamlet: '',
        house_number: '',
        building: '',
        amenity: '',
        coordinates: `${location.lat}, ${location.lng}`
      };
      
      console.log('Fallback location data:', locationData);
      onLocationSelect(locationData);
    }
  };

  const getAddressForLocation = async (location) => {
    try {
      console.log('Getting address for location:', location);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&addressdetails=1&accept-language=en`
      );
      const data = await response.json();
      console.log('Address response:', data);
      
      if (data && data.address) {
        const addr = data.address;
        const parts = [];
        
        // Street level details
        if (addr.house_number) parts.push(addr.house_number);
        if (addr.building) parts.push(addr.building);
        if (addr.road) parts.push(addr.road);
        
        // Area level details
        if (addr.suburb && addr.suburb !== addr.road) parts.push(addr.suburb);
        if (addr.city_district && addr.city_district !== addr.suburb) parts.push(addr.city_district);
        if (addr.hamlet && addr.hamlet !== addr.suburb) parts.push(addr.hamlet);
        if (addr.village && addr.village !== addr.suburb) parts.push(addr.village);
        
        // Municipal level details
        if (addr.municipality && addr.municipality !== addr.city) parts.push(addr.municipality);
        if (addr.zone && addr.zone !== addr.municipality) parts.push(addr.zone);
        
        // City level
        if (addr.city || addr.town) parts.push(addr.city || addr.town);
        
        // Administrative level
        if (addr.mandal && addr.mandal !== addr.city) parts.push(addr.mandal);
        if (addr.county && addr.county !== addr.city) parts.push(addr.county);
        if (addr.state) parts.push(addr.state);
        if (addr.postcode) parts.push(addr.postcode);
        if (addr.country) parts.push(addr.country);
        
        const fullAddress = parts.join(', ') || data.display_name;
        console.log('Resolved address:', fullAddress);
        setAddress(fullAddress);
      } else {
        const coordAddress = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
        console.log('Using coordinate address:', coordAddress);
        setAddress(coordAddress);
      }
    } catch (error) {
      console.error('Error getting address:', error);
      const coordAddress = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
      setAddress(coordAddress);
    }
  };

  const confirmLocation = async (location = null) => {
    const locationToUse = location || selectedLocation;
    if (!locationToUse) {
      console.log('confirmLocation called but no selectedLocation');
      throw new Error('No selected location');
    }

    console.log('confirmLocation called with location:', locationToUse);
    setIsReverseGeocoding(true);

    try {
      // Try multiple geocoding services for better address resolution
      let addressData = null;
      
      // First try: BigDataCloud API (free, good for India)
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${locationToUse.lat}&longitude=${locationToUse.lng}&localityLanguage=en`
        );
        const data = await response.json();
        
        if (data && data.locality) {
          addressData = {
            street: data.localityInfo?.administrative?.[0]?.name || data.locality || '',
            area: data.locality || data.city || '',
            city: data.city || data.locality || '',
            district: data.principalSubdivision || data.city || '',
            state: data.principalSubdivision || data.state || '',
            country: data.countryName || 'India',
            pincode: data.postcode || '',
            fullAddress: ''
          };
        }
      } catch (error) {
        console.log('BigDataCloud API failed, trying alternative...');
      }

      // Second try: OpenStreetMap Nominatim API (free, detailed)
      if (!addressData) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${locationToUse.lat}&lon=${locationToUse.lng}&addressdetails=1&accept-language=en`
          );
          const data = await response.json();
          
          if (data && data.address) {
            const addr = data.address;
            addressData = {
              street: addr.road || addr.pedestrian || addr.footway || '',
              area: addr.suburb || addr.neighbourhood || addr.quarter || '',
              city: addr.city || addr.town || addr.village || '',
              district: addr.county || addr.city_district || '',
              state: addr.state || '',
              country: addr.country || 'India',
              pincode: addr.postcode || '',
              fullAddress: data.display_name || '',
              // Additional detailed fields
              ward: addr.city_district || addr.suburb || '',
              municipality: addr.municipality || '',
              zone: addr.zone || '',
              mandal: addr.mandal || addr.taluka || '',
              village: addr.village || '',
              hamlet: addr.hamlet || '',
              house_number: addr.house_number || '',
              building: addr.building || '',
              amenity: addr.amenity || ''
            };
          }
        } catch (error) {
          console.log('Nominatim API failed, using coordinates...');
        }
      }

      // Build the final address in detailed hierarchical format
      let fullAddress = '';
      if (addressData) {
        const parts = [];
        
        // Street level details
        if (addressData.house_number) parts.push(addressData.house_number);
        if (addressData.building) parts.push(addressData.building);
        if (addressData.street) parts.push(addressData.street);
        
        // Area level details
        if (addressData.area && addressData.area !== addressData.street) parts.push(addressData.area);
        if (addressData.ward && addressData.ward !== addressData.area) parts.push(addressData.ward);
        if (addressData.hamlet && addressData.hamlet !== addressData.area) parts.push(addressData.hamlet);
        if (addressData.village && addressData.village !== addressData.area) parts.push(addressData.village);
        
        // Municipal level details
        if (addressData.municipality && addressData.municipality !== addressData.city) parts.push(addressData.municipality);
        if (addressData.zone && addressData.zone !== addressData.municipality) parts.push(addressData.zone);
        
        // City level
        if (addressData.city) parts.push(addressData.city);
        
        // Administrative level
        if (addressData.mandal && addressData.mandal !== addressData.city) parts.push(addressData.mandal);
        if (addressData.district && addressData.district !== addressData.city) parts.push(addressData.district);
        if (addressData.state) parts.push(addressData.state);
        if (addressData.pincode) parts.push(addressData.pincode);
        if (addressData.country) parts.push(addressData.country);
        
        fullAddress = parts.join(', ') || addressData.fullAddress;
        
        // If we have the full display name from Nominatim, use it as it's more complete
        if (addressData.fullAddress && addressData.fullAddress.length > fullAddress.length) {
          fullAddress = addressData.fullAddress;
        }
      }

      // If no address data, use coordinates
      if (!fullAddress) {
        fullAddress = `${locationToUse.lat.toFixed(6)}, ${locationToUse.lng.toFixed(6)}`;
      }

      const locationData = {
        lat: locationToUse.lat,
        lng: locationToUse.lng,
        address: fullAddress,
        // Basic fields
        pincode: addressData?.pincode || '',
        district: addressData?.district || '',
        state: addressData?.state || '',
        street: addressData?.street || '',
        area: addressData?.area || '',
        city: addressData?.city || '',
        country: addressData?.country || 'India',
        // Detailed fields
        ward: addressData?.ward || '',
        municipality: addressData?.municipality || '',
        zone: addressData?.zone || '',
        mandal: addressData?.mandal || '',
        village: addressData?.village || '',
        hamlet: addressData?.hamlet || '',
        house_number: addressData?.house_number || '',
        building: addressData?.building || '',
        amenity: addressData?.amenity || '',
        // Coordinates with high precision
        coordinates: `${locationToUse.lat}, ${locationToUse.lng}`
      };

      console.log('Location data being sent with full address:', locationData);
      console.log('Calling onLocationSelect with full address data');
      onLocationSelect(locationData);
      
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      // Fallback to coordinates
      const locationData = {
        lat: locationToUse.lat,
        lng: locationToUse.lng,
        address: `${locationToUse.lat.toFixed(6)}, ${locationToUse.lng.toFixed(6)}`
      };

      onLocationSelect(locationData);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Debug: Log when selectedLocation or address changes
  useEffect(() => {
    console.log('selectedLocation changed:', selectedLocation);
    console.log('address changed:', address);
  }, [selectedLocation, address]);

  return (
    <div className="w-full h-full relative">
      {/* Map Container */}
      <div className="w-full h-full border-2 border-gray-400 rounded-lg overflow-hidden">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Map click events */}
          <MapEvents onLocationSelect={handleLocationSelect} selectedLocation={selectedLocation} />
          
          {/* Selected location marker */}
          {selectedLocation && (
            <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
              <Popup>
                <div className="text-center">
                  <div className="font-medium text-gray-800">Selected Location</div>
                  <div className="text-sm text-gray-600">
                    {address || `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`}
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Instructions */}
      {!selectedLocation && (
        <div className="absolute top-4 left-4 right-4 bg-white bg-opacity-95 px-4 py-3 rounded-lg shadow-lg border">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Click anywhere on the map to select location</p>
              <p className="text-xs text-gray-600">Real OpenStreetMap - No API key required!</p>
            </div>
            <button
              type="button"
              onClick={() => {
                console.log('Test button clicked');
                handleLocationSelect({ lat: 17.5004, lng: 78.3356 });
              }}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test Click
            </button>
          </div>
        </div>
      )}

      {/* Select New Location Button */}
      {selectedLocation && (
        <div className="absolute top-4 left-4 right-4 bg-white bg-opacity-95 px-4 py-3 rounded-lg shadow-lg border">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Location Selected</p>
              <p className="text-xs text-gray-600">Click anywhere on the map to select a new location</p>
            </div>
            <button
              type="button"
              onClick={() => {
                console.log('Reset map clicked');
                setSelectedLocation(null);
                setAddress('');
                setIsReverseGeocoding(false);
              }}
              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
            >
              Reset Map
            </button>
          </div>
        </div>
      )}

      {/* Location Info and Controls */}
      {selectedLocation && (
        <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-h-64 overflow-y-auto">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-800 mb-2">📍 Selected Location:</p>
              
              <div className="bg-gray-50 p-3 rounded border mb-3">
                <p className="text-xs font-medium text-gray-700 mb-1">Name:</p>
                <p className="text-sm text-gray-800 break-words">
                  {address || 'Loading address...'}
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded border">
                <p className="text-xs font-medium text-gray-700 mb-1">Coordinates:</p>
                <p className="text-sm text-gray-800 font-mono">
                  {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLocation}
                disabled={isReverseGeocoding}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isReverseGeocoding ? 'Getting Address...' : 'Confirm Location'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenStreetMapPicker;
