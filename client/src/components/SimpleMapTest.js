import React, { useState } from 'react';

const SimpleMapTest = ({ onLocationSelect, onClose }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleMapClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const lat = 20.5937 + (0.5 - y / rect.height) * 15;
    const lng = 78.9629 + (x / rect.width - 0.5) * 25;
    
    setSelectedLocation({ lat, lng });
    console.log('Map clicked:', { lat, lng });
  };

  const confirmLocation = () => {
    if (selectedLocation) {
      const locationData = {
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        address: `Location: ${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`,
        pincode: '',
        district: '',
        state: '',
        city: '',
        country: 'India'
      };
      
      onLocationSelect(locationData);
    }
  };

  return (
    <div className="w-full h-96 relative">
      <div 
        className="w-full h-full bg-gradient-to-br from-green-200 to-blue-200 border-2 border-gray-400 rounded-lg cursor-pointer"
        onClick={handleMapClick}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl mb-2">🗺️</div>
            <p className="text-lg font-bold text-gray-700">Click to Select Location</p>
            <p className="text-sm text-gray-600">This is a test map</p>
          </div>
        </div>
        
        {selectedLocation && (
          <div 
            className="absolute w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg transform -translate-x-3 -translate-y-3"
            style={{
              left: `${((selectedLocation.lng - 66.9629) / 25 + 0.5) * 100}%`,
              top: `${((35.5937 - selectedLocation.lat) / 15 + 0.5) * 100}%`
            }}
          />
        )}
      </div>
      
      {selectedLocation && (
        <div className="absolute bottom-4 left-4 right-4 bg-white p-3 rounded shadow-lg border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Selected: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1 text-sm bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmLocation}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleMapTest;
