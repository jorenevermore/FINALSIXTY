'use client';

import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { auth } from '../../../lib/firebase';

export default function SettingsPage() {
  const [user] = useAuthState(auth);
  const router = useRouter();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-black mb-6">Settings</h1>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-black mb-4">Profile Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={user?.email || ''}
              disabled
            />
            <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div className="form-group">
            <label htmlFor="displayName" className="form-label">Display Name</label>
            <input
              type="text"
              id="displayName"
              className="form-input"
              placeholder="Enter your display name"
              defaultValue={user?.displayName || ''}
            />
          </div>
        </div>

        <div className="mt-6">
          <button className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-black mb-4">Barbershop Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label htmlFor="shopName" className="form-label">Barbershop Name</label>
            <input
              type="text"
              id="shopName"
              className="form-input"
              placeholder="Enter your barbershop name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">Phone Number</label>
            <input
              type="tel"
              id="phone"
              className="form-input"
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address" className="form-label">Address</label>
            <input
              type="text"
              id="address"
              className="form-input"
              placeholder="Enter your address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="city" className="form-label">City</label>
            <input
              type="text"
              id="city"
              className="form-input"
              placeholder="Enter your city"
            />
          </div>
        </div>

        <div className="mt-6">
          <button className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-black mb-4">Account Actions</h2>
        <div className="space-y-4">
          <div>
            <button className="btn btn-secondary">
              Change Password
            </button>
          </div>

          <div>
            <button
              className="btn bg-red-600 text-white hover:bg-red-700"
              onClick={async () => {
                try {
                  // Sign out from Firebase
                  await auth.signOut();

                  // Clear the Firebase token cookie
                  document.cookie = "firebaseToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

                  // Redirect to login page
                  router.push('/');
                } catch (error) {
                  console.error('Error signing out:', error);
                }
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
