'use client';

import React, { useState } from 'react';

interface BasicMapComponentProps {
  onLocationSelect: (location: { lat: number; lng: number } | null) => void;
  initialLocation?: { lat: number; lng: number } | null;
}

const BasicMapComponent: React.FC<BasicMapComponentProps> = ({
  onLocationSelect,
  initialLocation = null
}) => {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    initialLocation || { lat: 10.3157, lng: 123.8854 } // Default to Cebu City
  );

  // Immediately notify parent of the default location if none was provided
  React.useEffect(() => {
    if (!initialLocation) {
      onLocationSelect(selectedLocation);
    }
  }, []);

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lat = parseFloat(e.target.value);
    if (!isNaN(lat)) {
      const newLocation = {
        lat,
        lng: selectedLocation?.lng || 123.8854
      };
      setSelectedLocation(newLocation);
      onLocationSelect(newLocation);
    }
  };

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lng = parseFloat(e.target.value);
    if (!isNaN(lng)) {
      const newLocation = {
        lat: selectedLocation?.lat || 10.3157,
        lng
      };
      setSelectedLocation(newLocation);
      onLocationSelect(newLocation);
    }
  };

  const useDefaultLocation = () => {
    const defaultLocation = { lat: 10.3157, lng: 123.8854 }; // Cebu City
    setSelectedLocation(defaultLocation);
    onLocationSelect(defaultLocation);
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <div className="mb-4">
        <p className="text-sm text-gray-700 mb-2">
          Enter your barbershop location coordinates or use the default location (Cebu City).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
            <input
              type="text"
              value={selectedLocation?.lat || ''}
              onChange={handleLatChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 10.3157"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
            <input
              type="text"
              value={selectedLocation?.lng || ''}
              onChange={handleLngChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 123.8854"
            />
          </div>
        </div>
        <button
          onClick={useDefaultLocation}
          className="w-full px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          Use Default Location (Cebu City)
        </button>
      </div>

      {selectedLocation && (
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="flex items-start">
            <div className="flex-shrink-0 text-green-500 mr-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Location Selected</p>
              <p className="text-xs text-gray-600">
                Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicMapComponent;
