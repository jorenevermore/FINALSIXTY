'use client';

import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Booking } from './types';
import {
  TodayBookingsCard,
  BookingTable,
  ConfirmationModal,
  StatsCards,
  FilterBar
} from './components';

export default function AppointmentsPage() {
  const [user] = useAuthState(auth);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [selectedBooking, setSelectedBooking] = useState<{ id: string, action: 'accept' | 'cancel' } | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [barberFilter, setBarberFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch bookings
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (user) {
          // Fetch bookings
          const bookingsCollection = collection(db, 'bookings');
          const bookingsQuery = query(bookingsCollection, where('barbershopId', '==', user.uid));
          const bookingsSnapshot = await getDocs(bookingsQuery);

          const bookingsList = bookingsSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
          })) as Booking[];

          setBookings(bookingsList);

          // Set today's bookings
          updateTodayBookings(selectedDate, bookingsList);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Update today's bookings when selected date changes
  const updateTodayBookings = (date: Date, bookingsList: Booking[] = bookings) => {
    const dateString = date.toDateString();
    const filtered = bookingsList.filter(booking =>
      new Date(booking.date).toDateString() === dateString
    );
    setTodayBookings(filtered);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    updateTodayBookings(date);
  };

  // Update booking status
  const updateBookingStatus = async (bookingId: string, status: Booking['status'], reason?: string) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const updateData: any = { status };

      // Add reason if provided
      if (reason && status === 'canceled') {
        updateData.barberReason = reason;
      }

      // Add status history entry
      const timestamp = Date.now().toString();
      const historyEntry = {
        status,
        timestamp,
        updatedBy: 'barber',
        reason: reason || ''
      };

      // Get current booking to check if statusHistory exists
      const bookingDoc = await getDocs(query(collection(db, 'bookings'), where('id', '==', bookingId)));
      let currentBooking: any = null;

      bookingDoc.forEach(doc => {
        currentBooking = doc.data();
      });

      if (currentBooking) {
        if (currentBooking.statusHistory) {
          updateData.statusHistory = [...currentBooking.statusHistory, historyEntry];
        } else {
          updateData.statusHistory = [historyEntry];
        }
      }

      await updateDoc(bookingRef, updateData);

      // Update local state
      const updatedBookings = bookings.map(booking =>
        booking.id === bookingId ? {
          ...booking,
          status,
          barberReason: status === 'canceled' ? reason : booking.barberReason,
          statusHistory: updateData.statusHistory
        } : booking
      );

      setBookings(updatedBookings);
      updateTodayBookings(selectedDate, updatedBookings);

      // Close confirmation modal
      setSelectedBooking(null);

      return true;
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError('Failed to update booking status. Please try again.');
      return false;
    }
  };

  const handleAccept = (bookingId: string) => {
    setSelectedBooking({ id: bookingId, action: 'accept' });
  };

  const handleCancel = (bookingId: string) => {
    setSelectedBooking({ id: bookingId, action: 'cancel' });
  };

  const handleDelete = (bookingId: string) => {
    setBookingToDelete(bookingId);
  };

  const confirmAction = async () => {
    if (selectedBooking) {
      const { id, action } = selectedBooking;
      action === 'accept'
        ? await updateBookingStatus(id, 'confirmed')
        : await updateBookingStatus(id, 'canceled');
    }
  };

  const confirmDelete = async () => {
    if (bookingToDelete) {
      try {
        const bookingRef = doc(db, 'bookings', bookingToDelete);
        await deleteDoc(bookingRef);

        // Update local state
        const updatedBookings = bookings.filter(booking => booking.id !== bookingToDelete);
        setBookings(updatedBookings);
        updateTodayBookings(selectedDate, updatedBookings);

        // Close modals
        setBookingToDelete(null);
      } catch (err) {
        console.error('Error deleting booking:', err);
        setError('Failed to delete booking. Please try again.');
      }
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    // Status filter
    if (statusFilter !== 'all' && booking.status !== statusFilter) return false;

    // Barber filter
    if (barberFilter !== 'all' && booking.barberName !== barberFilter) return false;

    // Search query
    if (searchQuery && !booking.clientName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !booking.serviceOrdered.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    return true;
  });

  // Get unique barber names for filter
  const uniqueBarbers = Array.from(new Set(bookings.map(b => b.barberName)));

  return (
    <div className="p-4">

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mb-2"></div>
          <p>Loading appointments...</p>
        </div>
      ) : (
        <>
          {/* Stats Dashboard */}
          <StatsCards bookings={bookings} />

          {/* Calendar and Today's Bookings */}
          <TodayBookingsCard
            todayBookings={todayBookings}
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
          />

          {/* Filters */}
          <div className="flex justify-between items-center mb-4">
            <FilterBar
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              barberFilter={barberFilter}
              setBarberFilter={setBarberFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              uniqueBarbers={uniqueBarbers}
            />

            <a
              href="/dashboard/appointments/test"
              className="ml-4 px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition-colors flex items-center"
            >
              <i className="fas fa-vial mr-1"></i> Test Data
            </a>
          </div>

          {/* Appointments Table */}
          <BookingTable
            bookings={filteredBookings}
            handleAccept={handleAccept}
            handleCancel={handleCancel}
            handleDelete={handleDelete}
          />

          {/* Confirmation Modals */}
          <ConfirmationModal
            title="Confirm Action"
            message={`Are you sure you want to ${selectedBooking?.action === 'accept' ? 'accept' : 'cancel'} this booking?`}
            isOpen={selectedBooking !== null}
            onClose={() => setSelectedBooking(null)}
            onConfirm={confirmAction}
            confirmText={selectedBooking?.action === 'accept' ? 'Accept' : 'Cancel'}
            confirmColor={selectedBooking?.action === 'accept' ? 'bg-green-500' : 'bg-yellow-500'}
          />

          <ConfirmationModal
            title="Confirm Deletion"
            message="Are you sure you want to delete this booking? This action cannot be undone."
            isOpen={bookingToDelete !== null}
            onClose={() => setBookingToDelete(null)}
            onConfirm={confirmDelete}
            confirmText="Delete"
            confirmColor="bg-red-500"
          />


        </>
      )}
    </div>
  );
}
