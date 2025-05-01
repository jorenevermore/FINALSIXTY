'use client';

import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../../lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { 
  SummaryCards, 
  AppointmentTrends, 
  ServicePopularity, 
  BarberPerformance,
  RevenueChart,
  CustomerRetention,
  AppointmentStatusChart
} from './components';
import DateRangePicker from './components/DateRangePicker';

interface Booking {
  id: string;
  clientName: string;
  serviceOrdered: string;
  barberName: string;
  styleOrdered: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed';
  barbershopId: string;
  price?: string;
  clientId?: string;
  createdAt?: Timestamp;
}

export default function AnalyticsPage() {
  const [user] = useAuthState(auth);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Date range filter
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Default to last 30 days
    return date;
  });
  const [endDate, setEndDate] = useState<Date>(new Date());
  
  // Fetch bookings data
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const bookingsCollection = collection(db, 'bookings');
        const bookingsQuery = query(
          bookingsCollection,
          where('barbershopId', '==', user.uid)
        );
        
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const bookingsData: Booking[] = [];
        
        bookingsSnapshot.forEach(doc => {
          const data = doc.data() as Booking;
          bookingsData.push({
            ...data,
            id: doc.id
          });
        });
        
        setBookings(bookingsData);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load analytics data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [user]);
  
  // Filter bookings by date range
  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    return bookingDate >= startDate && bookingDate <= endDate;
  });
  
  // Calculate key metrics
  const totalAppointments = filteredBookings.length;
  const completedAppointments = filteredBookings.filter(b => b.status === 'completed').length;
  const canceledAppointments = filteredBookings.filter(b => b.status === 'canceled').length;
  const pendingAppointments = filteredBookings.filter(b => b.status === 'pending').length;
  const confirmedAppointments = filteredBookings.filter(b => b.status === 'confirmed').length;
  
  // Calculate total revenue (if price is available)
  const totalRevenue = filteredBookings
    .filter(b => b.status === 'completed' && b.price)
    .reduce((sum, booking) => sum + (parseFloat(booking.price || '0') || 0), 0);
  
  // Get unique services
  const uniqueServices = [...new Set(filteredBookings.map(b => b.serviceOrdered))];
  
  // Get unique barbers
  const uniqueBarbers = [...new Set(filteredBookings.map(b => b.barberName))];
  
  // Get unique customers
  const uniqueCustomers = [...new Set(filteredBookings.map(b => b.clientId || b.clientName))];
  
  // Handle date range change
  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };
  
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
          <p>Loading analytics data...</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-700">Business Analytics</h2>
            <DateRangePicker 
              startDate={startDate}
              endDate={endDate}
              onChange={handleDateRangeChange}
            />
          </div>
          
          <SummaryCards 
            totalAppointments={totalAppointments}
            completedAppointments={completedAppointments}
            canceledAppointments={canceledAppointments}
            pendingAppointments={pendingAppointments}
            confirmedAppointments={confirmedAppointments}
            totalRevenue={totalRevenue}
            uniqueCustomers={uniqueCustomers.length}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <AppointmentTrends bookings={filteredBookings} />
            <RevenueChart bookings={filteredBookings} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <ServicePopularity bookings={filteredBookings} />
            <AppointmentStatusChart bookings={filteredBookings} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BarberPerformance bookings={filteredBookings} />
            <CustomerRetention bookings={filteredBookings} />
          </div>
        </>
      )}
    </div>
  );
}
