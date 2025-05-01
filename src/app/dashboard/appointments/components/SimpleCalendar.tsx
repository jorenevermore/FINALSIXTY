'use client';

import React, { useState } from 'react';

interface SimpleCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const SimpleCalendar = ({ selectedDate, onDateChange }: SimpleCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date: Date) => {
    return date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();
  };

  const days = [];
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-7 w-7"></div>);
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    days.push(
      <button
        key={day}
        onClick={() => onDateChange(date)}
        className={`h-7 w-7 rounded-full flex items-center justify-center text-xs transition-colors
          ${isToday(date) ? 'bg-gray-200' : ''}
          ${isSelected(date) ? 'bg-black text-white' : 'hover:bg-gray-100'}
        `}
      >
        {day}
      </button>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded text-gray-500">
          <i className="fas fa-chevron-left text-xs"></i>
        </button>
        <div className="text-sm font-medium">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded text-gray-500">
          <i className="fas fa-chevron-right text-xs"></i>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {dayNames.map(day => (
          <div key={day} className="text-center text-[10px] text-gray-500 font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, index) => (
          <div key={index} className="flex justify-center">
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleCalendar;
