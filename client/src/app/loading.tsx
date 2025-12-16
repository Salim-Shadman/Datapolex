export default function Loading() {
  return (
    <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {/* Animated Logo/Spinner */}
        <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <h3 className="text-lg font-medium text-gray-700 animate-pulse">Loading Workspace...</h3>
      </div>
    </div>
  );
}