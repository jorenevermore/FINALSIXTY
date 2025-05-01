'use client';

import React from 'react';
import SimpleDatePicker from './SimpleDatePicker';
import { Booking } from '../types';

interface TodayBookingsCardProps {
  todayBookings: Booking[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const TodayBookingsCard = ({
  todayBookings,
  selectedDate,
  onDateChange
}: TodayBookingsCardProps) => {
  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Helper function to get status badge styling
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'canceled':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'no-show':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'fas fa-clock';
      case 'confirmed':
        return 'fas fa-check-circle';
      case 'in-progress':
        return 'fas fa-spinner fa-spin';
      case 'completed':
        return 'fas fa-check-double';
      case 'canceled':
        return 'fas fa-times-circle';
      case 'no-show':
        return 'fas fa-user-slash';
      default:
        return 'fas fa-question-circle';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
        <div className="flex items-center">
          <i className="fas fa-calendar-day text-blue-500 mr-2"></i>
          <span className="text-sm font-medium">Appointments for {formattedDate}</span>
        </div>
        <div className="flex items-center">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full mr-3">
            {todayBookings.length} {todayBookings.length === 1 ? 'appointment' : 'appointments'}
          </span>
          <SimpleDatePicker selectedDate={selectedDate} onDateChange={onDateChange} />
        </div>
      </div>

      <div className="p-4">
        {todayBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayBookings.map(booking => (
              <div
                key={booking.id}
                className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => window.location.href = `/dashboard/appointments/${booking.id}`}
              >
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-2 flex-shrink-0">
                    {booking.clientName.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <div className="font-medium text-gray-900 truncate">{booking.clientName}</div>
                  </div>
                  <div className="ml-auto">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                      ${getStatusBadgeStyle(booking.status)}`}
                    >
                      <i className={`${getStatusIcon(booking.status)} text-xs mr-1`}></i>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('-', ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="text-gray-500 truncate max-w-[60%]">
                    {booking.serviceOrdered}
                  </div>
                  <div className="font-medium text-gray-900">{booking.time}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-3xl mb-2"><i className="far fa-calendar-check"></i></div>
            <p className="font-medium mb-1">No appointments for this day</p>
            <p className="text-xs">Select another date to view appointments</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayBookingsCard;
