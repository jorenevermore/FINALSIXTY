'use client';

import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../../lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Barber, getAllBarbers, getBarbersByBarbershopId, addBarber, updateBarber, deleteBarber } from '../../../services/barberService';

export default function StaffPage() {
  const [user] = useAuthState(auth);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state for adding/editing barbers
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBarber, setCurrentBarber] = useState<Barber | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  // Fetch barbershop details and barbers
  useEffect(() => {
    const fetchBarbershopDetails = async () => {
      try {
        if (user) {
          // First, get the barbershop details
          const barbershopDoc = await getDoc(doc(db, 'barbershops', user.uid));
          if (barbershopDoc.exists()) {
            // Now fetch barbers for this barbershop
            const fetchedBarbers = await getBarbersByBarbershopId(user.uid);
            setBarbers(fetchedBarbers);
          } else {
            setError("No barbershop found for this account. Please set up your barbershop first.");
          }
        }
      } catch (err) {
        console.error('Error fetching barbershop details:', err);
        setError('Failed to load barbers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    setError(null);
    fetchBarbershopDetails();
  }, [user]);

  // Reset form fields
  const resetForm = () => {
    setFullName('');
    setEmail('');
    setContactNumber('');
    setAddress('');
    setIsAvailable(true);
    setCurrentBarber(null);
    setIsEditing(false);
  };

  // Open form for adding a new barber
  const handleAddBarber = () => {
    resetForm();
    setIsFormOpen(true);
  };

  // Open form for editing an existing barber
  const handleEditBarber = (barber: Barber) => {
    setCurrentBarber(barber);
    setFullName(barber.fullName);
    setEmail(barber.email);
    setContactNumber(barber.contactNumber);
    setAddress(barber.address);
    setIsAvailable(barber.isAvailable);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      setLoading(true);

      // Get barbershop details
      const barbershopDoc = await getDoc(doc(db, 'barbershops', user.uid));
      if (!barbershopDoc.exists()) {
        setError('Barbershop details not found. Please set up your barbershop first.');
        setLoading(false);
        return;
      }

      const barbershopData = barbershopDoc.data();

      const barberData = {
        fullName,
        email,
        contactNumber,
        address,
        isAvailable,
        affiliatedBarbershopId: user.uid,
        affiliatedBarbershop: barbershopData.name || user.email || 'Unknown Barbershop'
      };

      if (isEditing && currentBarber) {
        // Update existing barber
        await updateBarber(currentBarber.barberId, barberData);

        // Update local state
        setBarbers(barbers.map(b =>
          b.barberId === currentBarber.barberId
            ? { ...barberData, barberId: currentBarber.barberId }
            : b
        ));
      } else {
        // Add new barber
        const newBarberId = await addBarber(barberData);

        // Also update the barbershop document to include this barber
        await updateDoc(doc(db, 'barbershops', user.uid), {
          barbers: arrayUnion(newBarberId)
        });

        // Update local state
        setBarbers([...barbers, { ...barberData, barberId: newBarberId }]);
      }

      // Close form and reset fields
      setIsFormOpen(false);
      resetForm();
    } catch (err) {
      console.error('Error saving barber:', err);
      setError('Failed to save barber. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle barber deletion
  const handleDeleteBarber = async (barberId: string) => {
    if (!confirm('Are you sure you want to delete this barber?')) return;

    try {
      setLoading(true);

      if (user) {
        // First, remove the barber from the barbershop's barbers array
        // This requires a different approach since we can't easily remove from an array
        // We'll need to get the current array, filter it, and set it back
        const barbershopDoc = await getDoc(doc(db, 'barbershops', user.uid));
        if (barbershopDoc.exists()) {
          const barbershopData = barbershopDoc.data();
          const currentBarbers = barbershopData.barbers || [];
          const updatedBarbers = currentBarbers.filter((id: string) => id !== barberId);

          // Update the barbershop document
          await updateDoc(doc(db, 'barbershops', user.uid), {
            barbers: updatedBarbers
          });
        }
      }

      // Delete the barber document
      await deleteBarber(barberId);

      // Update local state
      setBarbers(barbers.filter(b => b.barberId !== barberId));
    } catch (err) {
      console.error('Error deleting barber:', err);
      setError('Failed to delete barber. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle barber availability
  const toggleAvailability = async (barber: Barber) => {
    try {
      setLoading(true);
      const newAvailability = !barber.isAvailable;

      // Update in database
      await updateBarber(barber.barberId, { isAvailable: newAvailability });

      // Update local state
      setBarbers(barbers.map(b =>
        b.barberId === barber.barberId
          ? { ...b, isAvailable: newAvailability }
          : b
      ));
    } catch (err) {
      console.error('Error updating availability:', err);
      setError('Failed to update availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Staff Management</h1>
        <button
          className="btn btn-primary"
          onClick={handleAddBarber}
        >
          <i className="fas fa-plus mr-2"></i> Add Barber
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Barber Form */}
      {isFormOpen && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-black mb-4">
            {isEditing ? 'Edit Barber' : 'Add New Barber'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactNumber" className="form-label">Contact Number</label>
                <input
                  type="text"
                  id="contactNumber"
                  className="form-input"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="address" className="form-label">Address</label>
                <input
                  type="text"
                  id="address"
                  className="form-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-group col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-black"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                  />
                  <span className="ml-2 text-gray-700">Available for appointments</span>
                </label>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Barber'}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsFormOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View Toggle Buttons */}
      <div className="mb-6 flex space-x-4">
        <button
          className="px-4 py-2 rounded-md bg-black text-white font-medium text-sm"
          onClick={() => setViewMode('grid')}
        >
          <i className="fas fa-th-large mr-2"></i> Grid View
        </button>
        <button
          className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 font-medium text-sm"
          onClick={() => setViewMode('table')}
        >
          <i className="fas fa-list mr-2"></i> Table View
        </button>
      </div>

      {/* Barbers List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading && !isFormOpen ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mb-2"></div>
            <p>Loading barbers...</p>
          </div>
        ) : barbers.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No barbers found. Add your first barber to get started.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {barbers.map((barber) => (
                <div key={barber.barberId} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="p-1 bg-gray-50 border-b border-gray-200">
                    <div className="flex justify-end">
                      <button
                        className={`w-12 h-6 rounded-full flex items-center ${barber.isAvailable ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'} p-1 transition-all duration-200 ease-in-out`}
                        onClick={() => toggleAvailability(barber)}
                      >
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mr-4">
                        <i className="fas fa-user-alt text-2xl"></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{barber.fullName}</h3>
                        <p className="text-sm text-gray-500">{barber.email}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-start">
                        <div className="text-gray-500 w-5 mt-0.5 mr-2">
                          <i className="fas fa-phone-alt"></i>
                        </div>
                        <div className="text-sm text-gray-700">{barber.contactNumber}</div>
                      </div>

                      <div className="flex items-start">
                        <div className="text-gray-500 w-5 mt-0.5 mr-2">
                          <i className="fas fa-map-marker-alt"></i>
                        </div>
                        <div className="text-sm text-gray-700">{barber.address}</div>
                      </div>

                      <div className="flex items-center">
                        <div className="text-gray-500 w-5 mr-2">
                          <i className="fas fa-circle"></i>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            barber.isAvailable
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {barber.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                      <button
                        className="p-2 text-gray-600 hover:text-black rounded-full hover:bg-gray-100"
                        onClick={() => handleEditBarber(barber)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="p-2 text-red-600 hover:text-red-900 rounded-full hover:bg-red-50"
                        onClick={() => handleDeleteBarber(barber.barberId)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {barbers.map((barber) => (
                  <tr key={barber.barberId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                          <i className="fas fa-user-alt"></i>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{barber.fullName}</div>
                          <div className="text-sm text-gray-500">{barber.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{barber.contactNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{barber.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          barber.isAvailable
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {barber.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-gray-600 hover:text-black mr-3"
                        onClick={() => toggleAvailability(barber)}
                      >
                        <i className={`fas ${barber.isAvailable ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i>
                      </button>
                      <button
                        className="text-gray-600 hover:text-black mr-3"
                        onClick={() => handleEditBarber(barber)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteBarber(barber.barberId)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
