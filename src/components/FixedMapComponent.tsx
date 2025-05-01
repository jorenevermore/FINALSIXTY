'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

// Default location (Cebu City, Philippines)
const DEFAULT_LOCATION = { lat: 10.3157, lng: 123.8854 };
const ZOOM_LEVEL = 15;

interface Location {
  lat: number;
  lng: number;
}

interface MapComponentProps {
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location | null;
}

const FixedMapComponent: React.FC<MapComponentProps> = ({
  onLocationSelect,
  initialLocation = null
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize the map
  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      try {
        setLoading(true);

        // Load the Google Maps API
        const loader = new Loader({
          apiKey: 'AIzaSyAAlwboaaSEPBpdZqSJXmbGIRdQS9TYHlc',
          version: 'weekly',
          libraries: ['places']
        });

        await loader.load();

        // Create the map - we already checked that mapRef.current exists above
        const googleMap = new window.google.maps.Map(mapRef.current!, {
          center: initialLocation || DEFAULT_LOCATION,
          zoom: ZOOM_LEVEL,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        });

        setMap(googleMap);

        // Create a marker
        const newMarker = new window.google.maps.Marker({
          position: initialLocation || DEFAULT_LOCATION,
          map: googleMap,
          draggable: true,
          animation: window.google.maps.Animation.DROP
        });

        setMarker(newMarker);

        // Set initial location if provided
        if (initialLocation) {
          googleMap.setCenter(initialLocation);
          newMarker.setPosition(initialLocation);
          onLocationSelect(initialLocation);
        } else {
          // Try to get user's location
          getUserLocation(googleMap, newMarker);
        }

        // Add event listeners
        newMarker.addListener('dragend', function() {
          const position = newMarker.getPosition();
          const newLocation = {
            lat: position.lat(),
            lng: position.lng()
          };
          onLocationSelect(newLocation);
        });

        googleMap.addListener('click', function(event: any) {
          const clickedLocation = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          };
          newMarker.setPosition(clickedLocation);
          onLocationSelect(clickedLocation);
        });

        setLoading(false);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to load Google Maps. Please try again or use the default location.');
        setLoading(false);
      }
    };

    initMap();

    // Cleanup
    return () => {
      if (marker) {
        marker.setMap(null);
      }
    };
  }, []);

  // Function to get user's location
  const getUserLocation = (googleMap: any, mapMarker: any) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          googleMap.setCenter(userLocation);
          mapMarker.setPosition(userLocation);
          onLocationSelect(userLocation);
        },
        () => {
          // Error getting location, use default
          googleMap.setCenter(DEFAULT_LOCATION);
          mapMarker.setPosition(DEFAULT_LOCATION);
          onLocationSelect(DEFAULT_LOCATION);
        }
      );
    } else {
      // Geolocation not supported
      googleMap.setCenter(DEFAULT_LOCATION);
      mapMarker.setPosition(DEFAULT_LOCATION);
      onLocationSelect(DEFAULT_LOCATION);
    }
  };

  // Function to use default location
  const useDefaultLocation = () => {
    if (map && marker) {
      map.setCenter(DEFAULT_LOCATION);
      marker.setPosition(DEFAULT_LOCATION);
      onLocationSelect(DEFAULT_LOCATION);
    }
  };

  // Function to use user's location
  const useMyLocation = () => {
    if (map && marker) {
      getUserLocation(map, marker);
    }
  };

  if (loading) {
    return (
      <div className="w-full rounded-lg border border-gray-300 mb-4 flex items-center justify-center bg-gray-100" style={{ height: '400px' }}>
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-lg border border-gray-300 mb-4 bg-gray-100 p-4">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={useDefaultLocation}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
        >
          Use Default Location (Cebu City)
        </button>
      </div>
    );
  }

  return (
    <div className="map-container">
      <div
        ref={mapRef}
        className="w-full rounded-lg border border-gray-300 mb-3 shadow-md"
        style={{ height: '400px' }}
      />

      <div className="flex justify-between mb-2">
        <button
          onClick={useMyLocation}
          className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors"
        >
          Use My Location
        </button>

        <button
          onClick={useDefaultLocation}
          className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
        >
          Use Default Location
        </button>
      </div>
    </div>
  );
};

export default FixedMapComponent;
