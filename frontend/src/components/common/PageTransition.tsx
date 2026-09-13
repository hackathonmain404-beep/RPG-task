import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Start progress sweep indicator on route change
    setIsNavigating(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Fast 240ms transition matches pageTransitionIn animation (220ms)
    timeoutRef.current = setTimeout(() => {
      setIsNavigating(false);
    }, 240);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [location.pathname]);

  return (
    <div className="page-transition-wrapper">
      {/* Top luminous progress line sweep during page transition */}
      {isNavigating && (
        <div
          className="page-loading-progress-bar"
          role="progressbar"
          aria-label="Navigating to new chamber"
        />
      )}

      {/* Main Content Animated Container */}
      <div key={location.pathname} className="page-transition-container">
        {children}
      </div>
    </div>
  );
};
