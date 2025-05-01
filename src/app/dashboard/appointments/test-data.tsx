'use client';

import { db, auth } from '../../../lib/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function TestDataGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [user] = useAuthState(auth);

  const generatePendingBooking = async () => {
    if (!user) {
      setResult('Error: You must be logged in to create test data');
      return;
    }

    try {
      setLoading(true);
      setResult('');

      // Generate a random ID
      const randomId = Math.random().toString(36).substring(2, 10);

      // Create a new pending booking
      const newBooking = {
        id: randomId,
        clientName: 'Test Client',
        clientId: 'test-client-id',
        barbershopId: user.uid, // Current user's ID (barbershop)
        barbershopName: 'Test Barbershop',
        barberName: 'Test Barber',
        serviceOrdered: 'Haircut',
        styleOrdered: 'Classic Style',
        totalPrice: 150,
        date: new Date().toISOString().split('T')[0], // Today's date
        time: '14:00', // 2 PM
        status: 'pending',
        createdAt: new Date().toISOString(),
        statusHistory: [
          {
            ongoingStatus: 'pending',
            timestamp: Date.now().toString(),
            updatedBy: 'client',
            reason: ''
          }
        ]
      };

      // Add the booking to Firestore
      await setDoc(doc(db, 'bookings', randomId), newBooking);

      setResult(`Successfully created a pending booking with ID: ${randomId}`);
    } catch (error: any) {
      console.error('Error creating test booking:', error);
      setResult(`Error: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Test Data Generator</h2>

      <button
        onClick={generatePendingBooking}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Creating...' : 'Create Pending Booking'}
      </button>

      {result && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}
