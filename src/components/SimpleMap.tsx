'use client';

import React, { useEffect, useRef, useState } from 'react';

interface SimpleMapProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number } | null;
}

const SimpleMap: React.FC<SimpleMapProps> = ({ onLocationSelect, initialLocation = null }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    initialLocation
  );

  // Default location (Cebu City)
  const DEFAULT_LOCATION = { lat: 10.3157, lng: 123.8854 };
  const ZOOM_LEVEL = 15;

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapRef.current) return;

    // Only initialize the map once
    if (mapInstanceRef.current) return;

    setIsLoading(true);

    // Initialize the map
    const initializeMap = () => {
      try {
        // Check if Google Maps API is already loaded
        if (window.google && window.google.maps) {
          initMap();
          return;
        }

        // If not loaded, create a script tag to load it
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAAlwboaaSEPBpdZqSJXmbGIRdQS9TYHlc&libraries=places&v=weekly`;
        script.async = true;
        script.defer = true;
        script.onload = initMap;
        script.onerror = () => {
          setError('Failed to load Google Maps. Please check your internet connection.');
          setIsLoading(false);
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Error setting up map:', error);
        setError('Failed to initialize map. Please try again.');
        setIsLoading(false);
      }
    };

    // Function to initialize the map once Google Maps is loaded
    const initMap = () => {
      try {

        // Create map with custom styling for a more modern look
        const map = new window.google.maps.Map(mapRef.current!, {
          center: initialLocation || DEFAULT_LOCATION,
          zoom: ZOOM_LEVEL,
          mapTypeControl: false, // Simplified UI
          streetViewControl: false, // Simplified UI
          fullscreenControl: false, // Simplified UI
          zoomControl: true,
          styles: [
            {
              featureType: "all",
              elementType: "labels.text.fill",
              stylers: [{ color: "#333333" }]
            },
            {
              featureType: "landscape",
              elementType: "all",
              stylers: [{ color: "#f5f5f5" }]
            },
            {
              featureType: "poi",
              elementType: "all",
              stylers: [{ visibility: "off" }]
            },
            {
              featureType: "road",
              elementType: "all",
              stylers: [{ saturation: -100 }, { lightness: 45 }]
            },
            {
              featureType: "transit",
              elementType: "all",
              stylers: [{ visibility: "simplified" }]
            }
          ]
        });

        mapInstanceRef.current = map;

        // Create marker with default red pin
        const marker = new window.google.maps.Marker({
          position: initialLocation || DEFAULT_LOCATION,
          map: map,
          draggable: true,
          animation: window.google.maps.Animation.DROP
        });

        markerRef.current = marker;

        // Set initial location
        if (initialLocation) {
          map.setCenter(initialLocation);
          marker.setPosition(initialLocation);
          setSelectedLocation(initialLocation);
        } else {
          // Use default location
          map.setCenter(DEFAULT_LOCATION);
          marker.setPosition(DEFAULT_LOCATION);
          setSelectedLocation(DEFAULT_LOCATION);
          onLocationSelect(DEFAULT_LOCATION);
        }

        // Add event listeners
        marker.addListener('dragend', function() {
          const position = marker.getPosition();
          const newLocation = {
            lat: position.lat(),
            lng: position.lng()
          };
          setSelectedLocation(newLocation);
          onLocationSelect(newLocation);
        });

        map.addListener('click', function(event: any) {
          const clickedLocation = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          };
          marker.setPosition(clickedLocation);
          setSelectedLocation(clickedLocation);
          onLocationSelect(clickedLocation);
        });

        // Try to get user's location if available
        if (navigator.geolocation) {
          const locationButton = document.createElement("button");
          locationButton.textContent = "Use My Location";
          locationButton.classList.add("custom-map-control-button", "bg-black", "text-white", "px-3", "py-1", "rounded", "text-sm", "absolute", "bottom-4", "left-4", "z-10");

          locationButton.addEventListener("click", () => {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const pos = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                };
                map.setCenter(pos);
                marker.setPosition(pos);
                setSelectedLocation(pos);
                onLocationSelect(pos);
              },
              () => {
                setError("Error: The Geolocation service failed.");
              }
            );
          });

          // Add the button to the DOM instead of using the controls API
          const mapContainer = mapRef.current;
          if (mapContainer) {
            locationButton.style.position = 'absolute';
            locationButton.style.bottom = '16px';
            locationButton.style.left = '16px';
            locationButton.style.zIndex = '10';
            mapContainer.appendChild(locationButton);
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing map:', error);
        setError('Failed to load map. Please try again.');
        setIsLoading(false);
      }
    };

    // Call the async function
    initializeMap();

    // Cleanup
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, []);

  // Helper function to format coordinates for display
  const formatCoordinate = (coord: number): string => {
    return coord.toFixed(6);
  };

  return (
    <div className="map-container relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10 rounded-lg">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10 rounded-lg">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-md">
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div
        ref={mapRef}
        className="w-full rounded-lg border border-gray-300 shadow-md transition-all duration-300 overflow-hidden"
        style={{ height: '350px' }}
      />

      {selectedLocation && (
        <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
          <div>
            <span className="font-medium">Lat:</span> {formatCoordinate(selectedLocation.lat)}
          </div>
          <div>
            <span className="font-medium">Lng:</span> {formatCoordinate(selectedLocation.lng)}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleMap;
