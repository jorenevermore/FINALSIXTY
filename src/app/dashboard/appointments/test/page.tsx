'use client';

import TestDataGenerator from '../test-data';
import Link from 'next/link';

export default function TestPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Test Data Generator</h1>
        <Link
          href="/dashboard/appointments"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 flex items-center"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Appointments
        </Link>
      </div>
      
      <div className="mb-6">
        <p className="text-gray-700 mb-4">
          Use this page to generate test data for your appointments. This will create real records in your Firestore database.
        </p>
      </div>
      
      <TestDataGenerator />
    </div>
  );
}
