'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { auth, db } from '../../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, GeoPoint } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { geohashForLocation } from 'geofire-common';
import SimpleMap from '../../components/SimpleMap';

export default function SignupPage() {
  // Barbershop information
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Account information
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showMap, setShowMap] = useState(false);
  const router = useRouter();

  // Check if user is already logged in
  const [user, userLoading] = useAuthState(auth);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user && !userLoading) {
      router.push('/dashboard');
    }
  }, [user, userLoading, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!name || !phone) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate location - but allow default location if map failed to load
    if (!location) {
      setError('Please select your barbershop location on the map');
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Generate geohash for location
      const geohash = geohashForLocation([location.lat, location.lng]);

      // Create barbershop profile in Firestore
      const barbershopId = user.uid;
      const createdAt = Date.now(); // Milliseconds since epoch

      await setDoc(doc(db, 'barbershops', barbershopId), {
        barbershopId, // UID as a field for easy reference
        name,
        phone,
        email,
        loc: {
          coordinates: new GeoPoint(location.lat, location.lng),
          geohash,
        },
        isOpen: false, // Default value
        barbers: [], // Default empty array
        services: [], // Default empty array
        createdAt, // Timestamp in milliseconds
        status: 'active',
      });

      // Get the ID token
      const idToken = await userCredential.user.getIdToken();

      // Store the token in a cookie for the middleware to use
      document.cookie = `firebaseToken=${idToken}; path=/; max-age=${60 * 60 * 24 * 5}`; // 5 days

      // Redirect will happen automatically due to the useEffect above
    } catch (error) {
      setError((error as Error).message);
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      // Validate first step
      if (!name || !phone) {
        setError('Please fill in all required fields');
        return;
      }

      if (!location) {
        setError('Please select your barbershop location on the map');
        return;
      }
    } else if (step === 2) {
      // Validate second step
      if (!email || !password || !confirmPassword) {
        setError('Please fill in all required fields');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    setError(null);
    setShowMap(false); // Reset map visibility when moving to next step
    setStep(step + 1);
  };

  const prevStep = () => {
    setError(null);
    setShowMap(false); // Reset map visibility when going back
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("/images/homepagebg.jpg")',
          backgroundSize: 'cover',
          filter: 'contrast(120%) brightness(105%)'
        }}></div>
      </div>

      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container-custom py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center">
              <Image src="/images/mainalotlogo.png" alt="ALOT Logo" width={36} height={36} className="object-contain" />
              <span className="ml-2 font-semibold text-gray-900">ALOT</span>
            </Link>
            <div>
              <Link href="/" className="text-gray-700 hover:text-black font-medium transition-colors duration-200">
                <i className="fas fa-arrow-left mr-2"></i>
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container-custom py-12 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 animate-fadeIn">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Register Your Barbershop</h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              Join our platform and connect with customers through our mobile app
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-10 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black transition-all duration-500 ease-in-out"
                  style={{ width: step >= 2 ? '100%' : '0%' }}
                ></div>
              </div>
            </div>
            <div className="flex justify-between mt-3">
              <div className="text-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm transition-all duration-300 ${step >= 1 ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'}`}>
                  1
                </div>
                <span className="text-sm font-medium text-gray-800">Shop Info</span>
              </div>
              <div className="text-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm transition-all duration-300 ${step >= 2 ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'}`}>
                  2
                </div>
                <span className="text-sm font-medium text-gray-800">Account</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                {step === 1 ? 'Barbershop Information' : 'Account Information'}
              </h2>
            </div>
            <div className="p-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 text-sm animate-fadeIn">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <i className="fas fa-exclamation-circle text-red-500 mr-2"></i>
                    </div>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSignup}>
                {/* Step 1: Barbershop Information */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="mb-5">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Barbershop Name*</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fas fa-store text-gray-400 group-hover:text-black transition-colors duration-200"></i>
                        </div>
                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors duration-200"
                          required
                          placeholder="e.g. Classic Cuts Barbershop"
                        />
                        {name && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <i className="fas fa-check text-green-500"></i>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-5">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Contact Number*</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fas fa-phone text-gray-400 group-hover:text-black transition-colors duration-200"></i>
                        </div>
                        <input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors duration-200"
                          required
                          placeholder="e.g. 09123456789"
                        />
                        {phone && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <i className="fas fa-check text-green-500"></i>
                          </div>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">This number will be visible to clients for booking inquiries</p>
                    </div>

                    {!showMap ? (
                      <div className="flex justify-end pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            if (!name || !phone) {
                              setError('Please fill in all required fields');
                              return;
                            }
                            setError(null);
                            setShowMap(true);
                          }}
                          className="inline-flex items-center px-4 py-2.5 bg-black text-white text-sm font-medium rounded-md shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                        >
                          Continue to Set Location
                          <i className="fas fa-arrow-right ml-2"></i>
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="mb-5">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Barbershop Location on Map*</label>
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <SimpleMap onLocationSelect={setLocation} initialLocation={location} />
                          </div>
                          <p className="mt-2 text-xs text-gray-500">This location will be used to help clients find your barbershop</p>
                        </div>

                        <div className="flex justify-between pt-4">
                          <button
                            type="button"
                            onClick={() => setShowMap(false)}
                            className="inline-flex items-center px-4 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                          >
                            <i className="fas fa-arrow-left mr-2"></i>
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              // Allow continuing even without location in case map failed to load
                              if (!location) {
                                // Use default location from Cebu City
                                const defaultLocation = { lat: 10.3157, lng: 123.8854 };
                                setLocation(defaultLocation);
                              }
                              setError(null);
                              nextStep();
                            }}
                            className="inline-flex items-center px-4 py-2.5 bg-black text-white text-sm font-medium rounded-md shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                          >
                            Continue to Account Setup
                            <i className="fas fa-arrow-right ml-2"></i>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Step 2: Account Information */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="mb-5">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address*</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fas fa-envelope text-gray-400 group-hover:text-black transition-colors duration-200"></i>
                        </div>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors duration-200"
                          required
                          placeholder="e.g. your@barbershop.com"
                        />
                        {email && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <i className="fas fa-check text-green-500"></i>
                          </div>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">You'll use this email to log in to your account</p>
                    </div>

                    <div className="mb-5">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password*</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fas fa-lock text-gray-400 group-hover:text-black transition-colors duration-200"></i>
                        </div>
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors duration-200"
                          required
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-black transition-colors duration-200"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <i className="fas fa-eye-slash"></i>
                          ) : (
                            <i className="fas fa-eye"></i>
                          )}
                        </button>
                        {password && password.length >= 6 && (
                          <div className="absolute inset-y-0 right-10 pr-3 flex items-center pointer-events-none">
                            <i className="fas fa-check text-green-500"></i>
                          </div>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
                    </div>

                    <div className="mb-5">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password*</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <i className="fas fa-lock text-gray-400 group-hover:text-black transition-colors duration-200"></i>
                        </div>
                        <input
                          id="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors duration-200"
                          required
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-black transition-colors duration-200"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <i className="fas fa-eye-slash"></i>
                          ) : (
                            <i className="fas fa-eye"></i>
                          )}
                        </button>
                        {confirmPassword && password === confirmPassword && (
                          <div className="absolute inset-y-0 right-10 pr-3 flex items-center pointer-events-none">
                            <i className="fas fa-check text-green-500"></i>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="inline-flex items-center px-4 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                      >
                        <i className="fas fa-arrow-left mr-2"></i>
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2.5 bg-black text-white text-sm font-medium rounded-md shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Registering...
                          </span>
                        ) : (
                          <>
                            Register Barbershop
                            <i className="fas fa-check ml-2"></i>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600">
                Already have an account? <Link href="/" className="text-black hover:underline font-medium transition-colors">Login</Link>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center text-gray-500 text-sm animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <p>By registering, you agree to our <a href="#" className="text-black hover:underline transition-colors">Terms of Service</a> and <a href="#" className="text-black hover:underline transition-colors">Privacy Policy</a>.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12 relative z-10">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Image src="/images/mainalotlogo.png" alt="ALOT Logo" width={32} height={32} className="object-contain" />
              <span className="ml-2 font-semibold text-gray-900">ALOT</span>
            </div>
            <div className="text-gray-600 text-sm">
              &copy; {new Date().getFullYear()} ALOT. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
