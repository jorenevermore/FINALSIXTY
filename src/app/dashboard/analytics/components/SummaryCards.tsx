'use client';

import React from 'react';

interface SummaryCardsProps {
  totalAppointments: number;
  completedAppointments: number;
  canceledAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  totalRevenue: number;
  uniqueCustomers: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalAppointments,
  completedAppointments,
  canceledAppointments,
  pendingAppointments,
  confirmedAppointments,
  totalRevenue,
  uniqueCustomers
}) => {
  // Calculate completion rate
  const completionRate = totalAppointments > 0 
    ? Math.round((completedAppointments / totalAppointments) * 100) 
    : 0;
  
  // Calculate cancellation rate
  const cancellationRate = totalAppointments > 0 
    ? Math.round((canceledAppointments / totalAppointments) * 100) 
    : 0;
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Appointments</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalAppointments}</h3>
          </div>
          <div className="p-2 bg-blue-100 rounded-lg">
            <i className="fas fa-calendar-check text-blue-500"></i>
          </div>
        </div>
        <div className="mt-2 flex items-center text-xs">
          <span className="text-gray-500">
            {pendingAppointments} pending • {confirmedAppointments} confirmed
          </span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 mb-1">Completion Rate</p>
            <h3 className="text-2xl font-bold text-gray-900">{completionRate}%</h3>
          </div>
          <div className="p-2 bg-green-100 rounded-lg">
            <i className="fas fa-check-circle text-green-500"></i>
          </div>
        </div>
        <div className="mt-2 flex items-center text-xs">
          <span className="text-gray-500">
            {completedAppointments} completed appointments
          </span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900">₱{totalRevenue.toLocaleString()}</h3>
          </div>
          <div className="p-2 bg-yellow-100 rounded-lg">
            <i className="fas fa-coins text-yellow-500"></i>
          </div>
        </div>
        <div className="mt-2 flex items-center text-xs">
          <span className="text-gray-500">
            From {completedAppointments} completed appointments
          </span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 mb-1">Unique Customers</p>
            <h3 className="text-2xl font-bold text-gray-900">{uniqueCustomers}</h3>
          </div>
          <div className="p-2 bg-purple-100 rounded-lg">
            <i className="fas fa-users text-purple-500"></i>
          </div>
        </div>
        <div className="mt-2 flex items-center text-xs">
          <span className="text-gray-500">
            {cancellationRate}% cancellation rate
          </span>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
