import React from 'react';

const LoadingSkeleton = ({ count = 3, type = 'card' }) => {
  if (type === 'card') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-md">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-3 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-4 animate-pulse"></div>
            <div className="flex space-x-2">
              <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-md">
            <div className="h-8 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-3 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6 mb-4 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded mt-6 animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default LoadingSkeleton;
