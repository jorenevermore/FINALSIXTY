import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Use react-firebase-hooks for auth state
  const [user, userLoading, userError] = useAuthState(auth);

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      {userError && (
        <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
          <p className="text-sm">
            <strong>Error:</strong> {userError.message}
          </p>
        </div>
      )}

      {userLoading ? (
        <div className="text-center py-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      ) : user ? (
        <div className="text-center">
          <p className="mb-4">Signed in as: {user.email}</p>
          <button
            onClick={signOut}
            disabled={loading}
            className={`px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Signing Out...' : 'Sign Out'}
          </button>
        </div>
      ) : (
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
              disabled={loading}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex space-x-4">
            <button
              type="submit"
              onClick={signUp}
              disabled={loading}
              className={`flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing...' : 'Sign Up'}
            </button>
            <button
              type="submit"
              onClick={signIn}
              disabled={loading}
              className={`flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing...' : 'Sign In'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Auth;
