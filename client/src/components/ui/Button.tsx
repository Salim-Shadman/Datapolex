import React from 'react';
import { Loader2 } from 'lucide-react'; // আইকন ইম্পোর্ট

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
}

export default function Button({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  leftIcon,
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  
  // স্টাইল ভেরিয়েন্ট
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500'
  };

  return (
    <button 
      className={`
        inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm 
        focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} 
        ${className}
      `}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
    </button>
  );
}