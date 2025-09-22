import React, { useState, useCallback } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import { MapPin, X } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapboxPicker = ({ onLocationSelect, onClose }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [address, setAddress] = useState('');

  // Default center for India
  const [viewState, setViewState] = useState({
    longitude: 78.9629,
    latitude: 20.5937,
    zoom: 6
  });

  const handleMapClick = useCallback((event) => {
    const { lng, lat } = event.lngLat;
    setSelectedLocation({ lat, lng });
    setAddress(''); // Clear previous address
  }, []);

  const confirmLocation = async () => {
    if (!selectedLocation) return;

    setIsReverseGeocoding(true);

    try {
      // Reverse geocoding using BigDataCloud API (free)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${selectedLocation.lat}&longitude=${selectedLocation.lng}&localityLanguage=en`
      );
      const data = await response.json();

      if (data && data.locality) {
        const fullAddress = `${data.locality || data.city || 'Unknown'}, ${data.principalSubdivision || data.state || 'Unknown'}, ${data.countryName || 'India'}`;
        
        const locationData = {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          address: fullAddress,
          pincode: data.postcode,
          district: data.principalSubdivision || data.city,
          state: data.principalSubdivision || data.state
        };

        onLocationSelect(locationData);
      } else {
        // Fallback to coordinates
        const locationData = {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          address: `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`
        };

        onLocationSelect(locationData);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      // Fallback to coordinates
      const locationData = {
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        address: `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`
      };

      onLocationSelect(locationData);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Get address for display when location is selected
  React.useEffect(() => {
    if (selectedLocation && !address) {
      const getAddress = async () => {
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${selectedLocation.lat}&longitude=${selectedLocation.lng}&localityLanguage=en`
          );
          const data = await response.json();
          
          if (data && data.locality) {
            const fullAddress = `${data.locality || data.city || 'Unknown'}, ${data.principalSubdivision || data.state || 'Unknown'}, ${data.countryName || 'India'}`;
            setAddress(fullAddress);
          } else {
            setAddress(`${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`);
          }
        } catch (error) {
          setAddress(`${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`);
        }
      };
      
      getAddress();
    }
  }, [selectedLocation, address]);

  return (
    <div className="w-full h-96 relative">
      {/* Map Container */}
      <div className="w-full h-full border-2 border-gray-400 rounded-lg overflow-hidden">
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          onClick={handleMapClick}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          style={{ width: '100%', height: '100%' }}
          interactiveLayerIds={[]}
        >
          {/* Selected location marker */}
          {selectedLocation && (
            <Marker
              longitude={selectedLocation.lng}
              latitude={selectedLocation.lat}
              anchor="bottom"
            >
              <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
            </Marker>
          )}
        </Map>
      </div>

      {/* Instructions */}
      {!selectedLocation && (
        <div className="absolute top-4 left-4 right-4 bg-white bg-opacity-95 px-4 py-3 rounded-lg shadow-lg border">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-800">Click anywhere on the map to select location</p>
              <p className="text-xs text-gray-600">Mapbox Maps - High quality, detailed maps!</p>
            </div>
          </div>
        </div>
      )}

      {/* Location Info and Controls */}
      {selectedLocation && (
        <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg border">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-800 mb-1">Selected Location:</p>
              <p className="text-sm text-gray-600">
                {address || `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`}
              </p>
              <p className="text-xs text-gray-500">
                Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
            
            <div className="flex gap-2">
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

export default MapboxPicker;
