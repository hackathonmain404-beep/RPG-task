import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { Shield } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const { user, isLoading, isGuest } = useAuth();
  const location = useLocation();

  // Only display the full-screen verification loader on initial load before
  // any session is loaded into state. When user is browsing live, tab switching
  // or window minimize/focus will never show this blocking screen.
  if (isLoading && !user && !isGuest) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.25rem',
          backgroundColor: 'var(--bg-canvas)',
          color: 'var(--text-secondary)',
        }}
        aria-live="polite"
        aria-busy="true"
      >
        <div style={{ animation: 'pulse 1.5s infinite ease-in-out' }}>
          <Shield size={48} color="#38bdf8" />
        </div>
        <p style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
          VERIFYING CITADEL ACCESS...
        </p>
      </div>
    );
  }

  if (!user && !isGuest) {
    // Preserve intended destination after authentication
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <Outlet />;
};

export const GuestOnlyRoute: React.FC = () => {
  const { user, isLoading, isGuest } = useAuth();

  if (isLoading) {
    return null;
  }

  if (user || isGuest) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <Outlet />;
};
