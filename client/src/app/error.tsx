'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // লগিং সার্ভারে এরর রিপোর্ট পাঠানো যেতে পারে (যেমন Sentry)
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
       <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 max-w-md w-full">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong!</h2>
        <p className="text-gray-500 mb-8 text-sm">
            We apologize for the inconvenience. An unexpected error has occurred.
        </p>

        <div className="space-y-3">
            <button
                onClick={() => reset()}
                className="flex items-center justify-center w-full px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium"
            >
                <RefreshCcw size={18} className="mr-2"/> Try Again
            </button>
            <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full px-4 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition font-medium"
            >
                Go to Dashboard
            </button>
        </div>
      </div>
    </div>
  );
}