import React from 'react';
import { Skeleton } from './Skeleton';

export const SettingsSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="Loading Citadel Settings"
      style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      {/* Title Skeleton */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Skeleton width="40px" height="40px" borderRadius="10px" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
          <Skeleton width="220px" height="28px" />
          <Skeleton width="380px" height="16px" />
        </div>
      </div>

      {/* Account Profile Card Skeleton */}
      <div className="rpg-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderRadius: '12px' }}>
        <Skeleton width="180px" height="22px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
          {[1, 2, 3].map(idx => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <Skeleton width="90px" height="12px" />
              <Skeleton width="100%" height="40px" borderRadius="8px" />
            </div>
          ))}
        </div>
        <div>
          <Skeleton width="160px" height="12px" style={{ marginBottom: '0.4rem' }} />
          <Skeleton width="100%" height="46px" borderRadius="8px" />
        </div>
      </div>

      {/* Dynamic Theme Token Switcher Skeleton */}
      <div className="rpg-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton width="200px" height="22px" />
          <Skeleton width="140px" height="24px" borderRadius="6px" />
        </div>
        <Skeleton width="80%" height="16px" />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
          {[1, 2, 3, 4].map(idx => (
            <div
              key={idx}
              className="rpg-card"
              style={{
                padding: '1rem',
                minHeight: '110px',
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <Skeleton width="60%" height="18px" />
              <Skeleton width="90%" height="14px" />
              <Skeleton width="40%" height="12px" style={{ marginTop: 'auto' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Session Termination Card Skeleton */}
      <div className="rpg-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderRadius: '12px' }}>
        <Skeleton width="180px" height="22px" />
        <Skeleton width="75%" height="16px" />
        <Skeleton width="160px" height="42px" borderRadius="8px" />
      </div>
    </div>
  );
};
