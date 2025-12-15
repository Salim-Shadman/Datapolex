import React from 'react';

interface ProgressBarProps {
  total: number;
  completed: number;
  progress?: number; // New optional prop for weighted progress
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ total, completed, progress, className }) => {
  // Use provided weighted progress, otherwise fallback to simple calculation
  let percentage = 0;
  
  if (typeof progress === 'number') {
    percentage = Math.round(progress);
  } else {
    percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  }

  let colorClass = 'bg-indigo-600';
  if (percentage === 100) colorClass = 'bg-green-500';
  else if (percentage >= 50) colorClass = 'bg-blue-500';

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium text-gray-700">Progress</span>
        <span className="font-medium text-gray-700">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${colorClass} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {/* Text remains strict: only Done / Total */}
        {completed}/{total} tasks fully completed
      </div>
    </div>
  );
};

export default ProgressBar;