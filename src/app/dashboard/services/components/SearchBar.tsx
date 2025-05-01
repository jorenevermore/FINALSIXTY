'use client';

import React, { useState, useRef, useEffect } from 'react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddService: () => void;
  onAddStyle: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onAddService,
  onAddStyle
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="relative flex-grow md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fas fa-search text-gray-400"></i>
          </div>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-black/10 transition-shadow"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              onClick={() => onSearchChange('')}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        <div className="hidden md:flex items-center text-sm text-gray-500">
          <span className="mr-2">Quick Add:</span>
          <button
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm transition-colors mr-2"
            onClick={onAddService}
          >
            <i className="fas fa-cut mr-1.5"></i> Service
          </button>
          <button
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm transition-colors"
            onClick={onAddStyle}
          >
            <i className="fas fa-image mr-1.5"></i> Style
          </button>
        </div>
      </div>

      <div className="relative w-full md:w-auto">
        <button
          ref={buttonRef}
          type="button"
          className="inline-flex justify-center w-full md:w-auto rounded-lg px-4 py-2.5 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <i className="fas fa-plus mr-2"></i>
          Add New
          <i className={`fas fa-chevron-down ml-2 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}></i>
        </button>

        {isMenuOpen && (
          <div
            ref={menuRef}
            className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 overflow-hidden"
          >
            <div className="py-1" role="none">
              <button
                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                onClick={() => {
                  setIsMenuOpen(false);
                  onAddService();
                }}
              >
                <i className="fas fa-cut mr-3 text-gray-400"></i>
                Add Service
              </button>
              <button
                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setIsMenuOpen(false);
                  onAddStyle();
                }}
              >
                <i className="fas fa-image mr-3 text-gray-400"></i>
                Add Style
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
