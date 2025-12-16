'use client';

import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileQuestion size={40} />
        </div>
        
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-8">
            The page you are looking for doesn't exist or has been moved.
        </p>

        <Link 
            href="/dashboard" 
            className="flex items-center justify-center w-full px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium"
        >
            <ArrowLeft size={18} className="mr-2"/> Back to Dashboard
        </Link>
      </div>
      
      <p className="mt-8 text-sm text-gray-400">Error Code: 404</p>
    </div>
  );
}