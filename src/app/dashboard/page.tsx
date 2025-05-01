'use client';

import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../lib/firebase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';

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

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dashboard data
  const [todayAppointments, setTodayAppointments] = useState<Booking[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Booking[]>([]);
  const [recentActivity, setRecentActivity] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    todayAppointments: 0,
    completedAppointments: 0,
    canceledAppointments: 0,
    totalRevenue: 0
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayStr = today.toISOString().split('T')[0];

        // Fetch all appointments
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

        // Calculate stats
        const totalAppointments = bookingsData.length;
        const pendingAppointments = bookingsData.filter(b => b.status === 'pending').length;
        const completedAppointments = bookingsData.filter(b => b.status === 'completed').length;
        const canceledAppointments = bookingsData.filter(b => b.status === 'canceled').length;

        // Calculate total revenue
        const totalRevenue = bookingsData
          .filter(b => b.status === 'completed' && b.price)
          .reduce((sum, booking) => sum + (parseFloat(booking.price || '0') || 0), 0);

        // Get today's appointments
        const todayAppts = bookingsData.filter(booking => booking.date === todayStr);

        // Get upcoming appointments (future dates, not canceled)
        const upcomingAppts = bookingsData
          .filter(booking => {
            const bookingDate = new Date(booking.date);
            return bookingDate >= today && booking.status !== 'canceled';
          })
          .sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, 5);

        // Get recent activity (latest 5 appointments)
        const recentActs = [...bookingsData]
          .sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 5);

        // Update state
        setStats({
          totalAppointments,
          pendingAppointments,
          todayAppointments: todayAppts.length,
          completedAppointments,
          canceledAppointments,
          totalRevenue
        });

        setTodayAppointments(todayAppts);
        setUpcomingAppointments(upcomingAppts);
        setRecentActivity(recentActs);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'fas fa-check-circle';
      case 'confirmed':
        return 'fas fa-calendar-check';
      case 'pending':
        return 'fas fa-clock';
      case 'canceled':
        return 'fas fa-times-circle';
      default:
        return 'fas fa-question-circle';
    }
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
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Appointments</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</h3>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <i className="fas fa-calendar-check text-blue-500"></i>
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs">
                <span className="text-gray-500">
                  {stats.pendingAppointments} pending
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Today's Appointments</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</h3>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <i className="fas fa-calendar-day text-green-500"></i>
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs">
                <span className="text-gray-500">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                  <h3 className="text-2xl font-bold text-gray-900">₱{stats.totalRevenue.toLocaleString()}</h3>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <i className="fas fa-coins text-yellow-500"></i>
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs">
                <span className="text-gray-500">
                  From {stats.completedAppointments} completed appointments
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Completion Rate</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {stats.totalAppointments > 0
                      ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100)
                      : 0}%
                  </h3>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <i className="fas fa-chart-line text-purple-500"></i>
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs">
                <span className="text-gray-500">
                  {stats.completedAppointments} completed • {stats.canceledAppointments} canceled
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <h3 className="text-base font-medium text-gray-700 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Link
                href="/dashboard/appointments"
                className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                  <i className="fas fa-calendar-alt text-blue-500"></i>
                </div>
                <span className="text-sm font-medium">Appointments</span>
              </Link>

              <Link
                href="/dashboard/services"
                className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
                  <i className="fas fa-cut text-green-500"></i>
                </div>
                <span className="text-sm font-medium">Services</span>
              </Link>

              <Link
                href="/dashboard/analytics"
                className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                  <i className="fas fa-chart-pie text-purple-500"></i>
                </div>
                <span className="text-sm font-medium">Analytics</span>
              </Link>

              <Link
                href="/dashboard/settings"
                className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                  <i className="fas fa-cog text-gray-500"></i>
                </div>
                <span className="text-sm font-medium">Settings</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-medium text-gray-700">Upcoming Appointments</h3>
                <Link href="/dashboard/appointments" className="text-xs text-blue-600 hover:text-blue-800">
                  View All <i className="fas fa-chevron-right ml-1"></i>
                </Link>
              </div>

              <div className="divide-y divide-gray-100">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map(appointment => (
                    <div
                      key={appointment.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/dashboard/appointments/${appointment.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3">
                            {appointment.clientName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{appointment.clientName}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {appointment.serviceOrdered} • {appointment.barberName}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">{formatDate(appointment.date)}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{appointment.time}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No upcoming appointments
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-medium text-gray-700">Recent Activity</h3>
                <Link href="/dashboard/appointments" className="text-xs text-blue-600 hover:text-blue-800">
                  View All <i className="fas fa-chevron-right ml-1"></i>
                </Link>
              </div>

              <div className="divide-y divide-gray-100">
                {recentActivity.length > 0 ? (
                  recentActivity.map(activity => (
                    <div
                      key={activity.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/dashboard/appointments/${activity.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${getStatusBadgeStyle(activity.status)}`}>
                            <i className={`${getStatusIcon(activity.status)} text-xs`}></i>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {activity.clientName} - {activity.serviceOrdered}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {formatDate(activity.date)} • {activity.time}
                            </div>
                          </div>
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeStyle(activity.status)}`}>
                            {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No recent activity
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-base font-medium text-gray-700 mb-3">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Email</div>
                <div className="text-sm font-medium">{user?.email}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Account ID</div>
                <div className="text-sm font-medium">{user?.uid}</div>
              </div>
              {user?.metadata?.creationTime && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Account Created</div>
                  <div className="text-sm font-medium">{user.metadata.creationTime}</div>
                </div>
              )}
              {user?.metadata?.lastSignInTime && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Last Sign In</div>
                  <div className="text-sm font-medium">{user.metadata.lastSignInTime}</div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
