'use client';

import { memo } from 'react';

interface OptimizedLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const OptimizedLoading = memo(function OptimizedLoading({ 
  size = 'md', 
  text = 'Lädt...', 
  className = '' 
}: OptimizedLoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      {/* Optimized spinner with CSS animations */}
      <div 
        className={`${sizeClasses[size]} border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin`}
        style={{
          animation: 'spin 1s linear infinite',
        }}
      />
      {text && (
        <p className="mt-2 text-sm text-gray-600 animate-pulse">
          {text}
        </p>
      )}
      
      {/* Skeleton loading for content */}
      <div className="w-full max-w-md mt-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
      </div>
    </div>
  );
});

export default OptimizedLoading;
