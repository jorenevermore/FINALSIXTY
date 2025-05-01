import React, { useState } from 'react';

interface SimpleLocationInputProps {
  onLocationSelect: (location: { lat: number; lng: number } | null) => void;
  initialLocation?: { lat: number; lng: number } | null;
}

const SimpleLocationInput: React.FC<SimpleLocationInputProps> = ({
  onLocationSelect,
  initialLocation = null,
}) => {
  const [latitude, setLatitude] = useState<string>(initialLocation?.lat.toString() || '');
  const [longitude, setLongitude] = useState<string>(initialLocation?.lng.toString() || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng)) {
        setError('Please enter valid numbers for latitude and longitude');
        return;
      }

      if (lat < -90 || lat > 90) {
        setError('Latitude must be between -90 and 90');
        return;
      }

      if (lng < -180 || lng > 180) {
        setError('Longitude must be between -180 and 180');
        return;
      }

      onLocationSelect({ lat, lng });
    } catch (error) {
      setError('Invalid coordinates. Please enter valid numbers.');
    }
  };

  const handleClear = () => {
    setLatitude('');
    setLongitude('');
    onLocationSelect(null);
  };

  const handleUseDefaultLocation = () => {
    // Default location (Cebu City, Philippines)
    const defaultLat = 10.3157;
    const defaultLng = 123.8854;
    
    setLatitude(defaultLat.toString());
    setLongitude(defaultLng.toString());
    onLocationSelect({ lat: defaultLat, lng: defaultLng });
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
              Latitude
            </label>
            <input
              id="latitude"
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 10.3157"
            />
          </div>
          <div>
            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
              Longitude
            </label>
            <input
              id="longitude"
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 123.8854"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Set Location
          </button>
          <button
            type="button"
            onClick={handleUseDefaultLocation}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Use Default Location (Cebu City)
          </button>
          {(latitude || longitude) && (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {latitude && longitude && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0 text-green-500 mr-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Location Selected</p>
              <p className="text-xs text-gray-600 mt-1">
                Coordinates: {parseFloat(latitude).toFixed(6)}, {parseFloat(longitude).toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleLocationInput;
