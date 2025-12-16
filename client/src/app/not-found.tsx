import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="space-y-6">
        <h1 className="text-9xl font-black text-indigo-200">404</h1>
        
        <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Page not found</h2>
            <p className="text-slate-500 max-w-md mx-auto">
                Sorry, we couldn't find the page you're looking for. It might have been removed or doesn't exist.
            </p>
        </div>

        <div className="flex justify-center gap-4">
            <Link 
                href="/dashboard" 
                className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition"
            >
                Go back home
            </Link>
            <button 
                onClick={() => window.history.back()}
                className="rounded-lg px-6 py-3 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-100 transition"
            >
                Go back
            </button>
        </div>
      </div>
    </div>
  );
}