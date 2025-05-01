'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Booking } from '../types';

interface BookingTableProps {
  bookings: Booking[];
  handleAccept: (id: string) => void;
  handleCancel: (id: string) => void;
  handleDelete: (id: string) => void;
}

const BookingTable = ({
  bookings,
  handleAccept,
  handleCancel,
  handleDelete
}: BookingTableProps) => {
  const router = useRouter();

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
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
        <div className="flex items-center">
          <i className="fas fa-list text-gray-400 mr-2"></i>
          <span className="text-sm font-medium text-gray-700">Your List</span>
        </div>
        <p className="text-xs text-gray-500">
          Showing <span className="font-medium text-gray-700">{bookings.length}</span> results
        </p>
      </div>

      <div className="overflow-x-auto">
        {bookings.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-500">CUSTOMER</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">SERVICE</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">BARBER</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">DATE & TIME</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">STATUS</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500 w-24">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map(booking => (
                <tr
                  key={booking.id}
                  className="hover:bg-gray-50 cursor-pointer border-l-2 border-transparent hover:border-black transition-colors"
                  onClick={() => router.push(`/dashboard/appointments/${booking.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3 flex-shrink-0">
                        {booking.clientName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 line-clamp-1">{booking.clientName}</div>
                        <div className="flex items-center mt-0.5">
                          {booking.isHomeService && (
                            <span className="inline-flex items-center mr-2 text-xs text-blue-600">
                              <i className="fas fa-home text-xs mr-1"></i> Home
                            </span>
                          )}
                          {booking.isEmergency && (
                            <span className="inline-flex items-center text-xs text-red-600">
                              <i className="fas fa-exclamation-circle text-xs mr-1"></i> Emergency
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="line-clamp-1 font-medium">{booking.serviceOrdered}</div>
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{booking.styleOrdered}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="line-clamp-1">{booking.barberName}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{new Date(booking.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{booking.time}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeStyle(booking.status)}`}>
                      <i className={`${getStatusIcon(booking.status)} text-xs mr-1`}></i>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('-', ' ')}
                    </span>
                    {(booking.reason || booking.barberReason) && (
                      <div className="text-xs text-gray-500 mt-1 flex items-center">
                        <i className="fas fa-comment-alt text-xs mr-1"></i> Has notes
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-1">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            className="p-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAccept(booking.id);
                            }}
                            title="Accept"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button
                            className="p-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancel(booking.id);
                            }}
                            title="Cancel"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </>
                      )}

                      <button
                        className="p-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(booking.id);
                        }}
                        title="Delete"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-6 text-center text-gray-500">
            <div className="text-3xl mb-3"><i className="far fa-calendar-times"></i></div>
            <p className="font-medium mb-1">No appointments found</p>
            <p className="text-xs">Try adjusting your filters or search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingTable;
