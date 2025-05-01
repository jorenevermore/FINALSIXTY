'use client';

import React, { useState } from 'react';
import { Booking } from '../types';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Booking;
  onAddNote: (note: string) => Promise<boolean>;
  isSubmitting: boolean;
}

const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onAddNote,
  isSubmitting
}) => {
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleAddNote = async () => {
    if (!note.trim()) return;
    const success = await onAddNote(note);
    if (success) {
      setNote('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full h-[80vh] flex flex-col overflow-hidden animate-fadeIn">
        {/* Chat header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
              {appointment.clientName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-medium text-black">Conversation with {appointment.clientName}</h3>
              <p className="text-xs text-gray-500">
                {appointment.clientNotes?.length || appointment.barbershopNotes?.length
                  ? `${(appointment.clientNotes?.length || 0) + (appointment.barbershopNotes?.length || 0)} messages`
                  : 'No messages yet'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Chat messages */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {/* System message for appointment creation */}
          <div className="flex justify-center">
            <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
              Appointment created on {appointment.createdAt ? new Date(appointment.createdAt).toLocaleDateString() : 'Unknown date'}
            </div>
          </div>

          {/* Status update message */}
          {appointment.status === 'canceled' && (
            <div className="flex justify-center my-2">
              <div className="bg-red-100 text-red-600 text-xs px-3 py-1 rounded-full">
                Appointment was canceled
              </div>
            </div>
          )}

          {/* Client messages */}
          {appointment.clientNotes && appointment.clientNotes.length > 0 &&
            appointment.clientNotes.map((note, index) => (
              <div key={`client-msg-${index}`} className="flex justify-start">
                <div className="max-w-[80%]">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2 flex-shrink-0">
                      {appointment.clientName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="bg-blue-50 p-3 rounded-lg rounded-tl-none">
                        <p className="text-sm text-gray-700">{note.text}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 ml-2">
                        {note.timestamp ? new Date(note.timestamp).toLocaleString() : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          }

          {/* Barbershop messages */}
          {appointment.barbershopNotes && appointment.barbershopNotes.length > 0 &&
            appointment.barbershopNotes.map((note, index) => (
              <div key={`shop-msg-${index}`} className="flex justify-end">
                <div className="max-w-[80%]">
                  <div className="flex items-start flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 ml-2 flex-shrink-0">
                      <i className="fas fa-store"></i>
                    </div>
                    <div className="text-right">
                      <div className="bg-green-50 p-3 rounded-lg rounded-tr-none">
                        <p className="text-sm text-gray-700">{note.text}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 mr-2">
                        {note.timestamp ? new Date(note.timestamp).toLocaleString() : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          }

          {/* Empty state */}
          {(!appointment.clientNotes || appointment.clientNotes.length === 0) && 
           (!appointment.barbershopNotes || appointment.barbershopNotes.length === 0) && (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                <i className="fas fa-comments text-xl"></i>
              </div>
              <p className="text-gray-500 text-center">No messages yet</p>
              <p className="text-gray-400 text-sm text-center mt-1">Start the conversation with your client</p>
            </div>
          )}
        </div>

        {/* Chat input */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex">
            <textarea
              className="flex-grow border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Type a message..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              disabled={isSubmitting}
            ></textarea>
            <button
              className="ml-2 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center disabled:bg-gray-300"
              disabled={!note.trim() || isSubmitting}
              onClick={handleAddNote}
            >
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <i className="fas fa-paper-plane"></i>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
