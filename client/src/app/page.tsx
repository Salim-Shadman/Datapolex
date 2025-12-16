'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react'; // assuming you have lucide-react for a spinner

/**
 * Root page component: Handles client-side authentication redirect.
 * If user is logged in, redirect to /dashboard.
 * If user is not logged in, redirect to /login.
 */
export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is logged in, redirect to dashboard
        router.push('/dashboard');
      } else {
        // User is NOT logged in, redirect to login
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  // Show a spinner while the authentication status is being checked
  // This prevents the page from flickering before redirect
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      <p className="ml-2 text-gray-700">Checking authentication...</p>
    </div>
  );
}