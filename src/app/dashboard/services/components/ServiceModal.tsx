'use client';

import React, { useState, useEffect } from 'react';
import { Service } from '../types';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../../lib/firebase';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: Service) => Promise<void>;
  initialService: Service;
  isEditing: boolean;
}

const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialService,
  isEditing
}) => {
  const [service, setService] = useState<Service>(initialService);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    setService(initialService);
    setImageFile(null);
    setError(null);
  }, [initialService, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setService(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setImageFile(file);

    // Create a preview
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setService(prev => ({
          ...prev,
          featuredImage: event.target?.result as string
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!service.title.trim()) {
      setError('Service title is required');
      return;
    }

    if (!isEditing && !service.featuredImage && !imageFile) {
      setError('Service image is required');
      return;
    }

    try {
      setIsUploading(true);
      let finalService = { ...service };

      // Upload image if a new one was selected
      if (imageFile) {
        const storageRef = ref(storage, `services/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        const downloadURL = await getDownloadURL(snapshot.ref);
        finalService.featuredImage = downloadURL;
      }

      await onSave(finalService);
      onClose();
    } catch (err) {
      console.error('Error saving service:', err);
      setError('Failed to save service. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setService(prev => ({ ...prev, featuredImage: null }));
    setImageFile(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-black">
              {isEditing ? 'Edit Service' : 'Add New Service'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
                <i className="fas fa-exclamation-circle mt-0.5 mr-2"></i>
                <p>{error}</p>
              </div>
            )}

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Title
              </label>
              <input
                type="text"
                name="title"
                value={service.title}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-shadow"
                placeholder="Enter service title"
                required
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="relative">
                <select
                  name="status"
                  value={service.status}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-shadow"
                >
                  <option value="Available">Available</option>
                  <option value="Disabled">Disabled</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Image {!isEditing && !service.featuredImage && <span className="text-red-500">*</span>}
              </label>

              {service.featuredImage ? (
                <div className="relative rounded-lg overflow-hidden mb-3">
                  <img
                    src={service.featuredImage}
                    alt="Preview"
                    className="w-full h-56 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-black bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90 transition-opacity"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ) : (
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    dragActive ? 'border-black bg-gray-50' : 'border-gray-300'
                  }`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="text-4xl text-gray-300 mb-3">
                    <i className="fas fa-cloud-upload-alt"></i>
                  </div>
                  <p className="text-gray-700 mb-2">Drag and drop your image here</p>
                  <p className="text-gray-500 text-sm mb-4">or</p>
                  <label className="inline-block px-4 py-2 bg-black text-white rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                    <span>Browse Files</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      required={!isEditing && !service.featuredImage}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-3">
                    Supported formats: JPG, PNG, GIF
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-5 bg-gray-50 flex justify-end space-x-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  Save Service
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceModal;
