'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react'; 


export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        
        router.push('/dashboard');
      } else {
        
        router.push('/login');
      }
    }
  }, [user, loading, router]);

 
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      <p className="ml-2 text-gray-700">Checking authentication...</p>
    </div>
  );
}