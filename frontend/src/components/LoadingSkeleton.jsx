import React from 'react';

/**
 * Simple skeleton loader. Accepts optional `height` and `className`.
 */
export default function LoadingSkeleton({ height = '1rem', className = '' }) {
  return (
    <div
      className={`animate-pulse bg-panel bg-opacity-50 rounded ${className}`}
      style={{ height }}
    />
  );
}
