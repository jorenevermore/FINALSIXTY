'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

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
}

interface AppointmentStatusChartProps {
  bookings: Booking[];
}

const AppointmentStatusChart: React.FC<AppointmentStatusChartProps> = ({ bookings }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Count bookings by status
    const statusCounts = {
      completed: 0,
      confirmed: 0,
      pending: 0,
      canceled: 0,
    };
    
    bookings.forEach(booking => {
      statusCounts[booking.status] += 1;
    });
    
    // Prepare data for chart
    const data = [
      statusCounts.completed,
      statusCounts.confirmed,
      statusCounts.pending,
      statusCounts.canceled,
    ];
    
    const labels = ['Completed', 'Confirmed', 'Pending', 'Canceled'];
    
    const backgroundColors = [
      'rgba(16, 185, 129, 0.7)',  // Green for completed
      'rgba(59, 130, 246, 0.7)',  // Blue for confirmed
      'rgba(245, 158, 11, 0.7)',  // Yellow for pending
      'rgba(239, 68, 68, 0.7)',   // Red for canceled
    ];
    
    // Create chart
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [
            {
              data,
              backgroundColor: backgroundColors,
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                boxWidth: 12,
                padding: 15,
              },
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed;
                  const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            },
          },
          cutout: '65%',
        },
      });
    }
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [bookings]);
  
  // Calculate completion rate
  const totalAppointments = bookings.length;
  const completedAppointments = bookings.filter(b => b.status === 'completed').length;
  const completionRate = totalAppointments > 0 
    ? Math.round((completedAppointments / totalAppointments) * 100) 
    : 0;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium text-gray-700">Appointment Status</h3>
        <div className="text-sm text-gray-500">
          Completion Rate: <span className="font-medium">{completionRate}%</span>
        </div>
      </div>
      <div className="h-64">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default AppointmentStatusChart;
