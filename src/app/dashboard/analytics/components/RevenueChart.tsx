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
  price?: string;
}

interface RevenueChartProps {
  bookings: Booking[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ bookings }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Filter completed bookings with price
    const completedBookings = bookings.filter(
      booking => booking.status === 'completed' && booking.price
    );
    
    // Group bookings by date
    const revenueByDate = completedBookings.reduce<Record<string, number>>((acc, booking) => {
      const date = new Date(booking.date).toISOString().split('T')[0];
      const price = parseFloat(booking.price || '0') || 0;
      acc[date] = (acc[date] || 0) + price;
      return acc;
    }, {});
    
    // Sort dates
    const sortedDates = Object.keys(revenueByDate).sort();
    
    // Prepare data for chart
    const data = sortedDates.map(date => revenueByDate[date]);
    
    // Format dates for display
    const labels = sortedDates.map(date => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    // Create chart
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Revenue',
              data,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderWidth: 2,
              tension: 0.3,
              fill: true,
              pointBackgroundColor: '#10b981',
              pointRadius: 3,
              pointHoverRadius: 5,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: function(context) {
                  return `₱${context.parsed.y.toLocaleString()}`;
                }
              }
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
            },
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '₱' + value;
                }
              },
            },
          },
        },
      });
    }
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [bookings]);
  
  // Calculate total revenue
  const totalRevenue = bookings
    .filter(booking => booking.status === 'completed' && booking.price)
    .reduce((sum, booking) => sum + (parseFloat(booking.price || '0') || 0), 0);
  
  // Calculate average revenue per appointment
  const completedAppointments = bookings.filter(b => b.status === 'completed' && b.price).length;
  const averageRevenue = completedAppointments > 0 
    ? totalRevenue / completedAppointments 
    : 0;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium text-gray-700">Revenue Trends</h3>
        <div className="text-sm text-gray-500">
          Avg: <span className="font-medium">₱{averageRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
      </div>
      <div className="h-64">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default RevenueChart;
