import React, { Suspense } from 'react';
import { PageSkeleton } from '../skeletons/PageSkeleton';

export interface RouteLoadingBoundaryProps {
  children: React.ReactNode;
}

export const RouteLoadingBoundary: React.FC<RouteLoadingBoundaryProps> = ({ children }) => {
  return (
    <Suspense fallback={<PageSkeleton />}>
      {children}
    </Suspense>
  );
};
