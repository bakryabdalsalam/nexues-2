import { memo } from 'react';

interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

export const LoadingSkeleton = memo(({ rows = 5, className = '' }: LoadingSkeletonProps) => {
  return (
    <div className={`animate-pulse ${className}`} role="status" aria-label="Loading content">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="grid grid-cols-6 gap-4">
            <div className="h-4 bg-gray-200 rounded col-span-2"></div>
            <div className="h-4 bg-gray-200 rounded col-span-1"></div>
            <div className="h-4 bg-gray-200 rounded col-span-3"></div>
          </div>
        ))}
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
});

LoadingSkeleton.displayName = 'LoadingSkeleton';
