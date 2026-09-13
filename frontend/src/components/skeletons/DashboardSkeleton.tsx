import React from 'react';
import { Skeleton } from './Skeleton';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="Loading Citadel Dashboard"
      style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      {/* 1. Welcome Session Banner Skeleton */}
      <div
        className="rpg-card"
        style={{
          padding: 'clamp(1.25rem, 3vw, 2rem)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, minWidth: '240px' }}>
          <Skeleton width="160px" height="22px" borderRadius="9999px" />
          <Skeleton width="65%" height="36px" borderRadius="6px" />
          <Skeleton width="85%" height="18px" borderRadius="4px" />
        </div>
        <Skeleton width="160px" height="42px" borderRadius="8px" />
      </div>

      {/* 2. 4 Quick Stat Cards Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: '1.25rem',
        }}
      >
        {[1, 2, 3, 4].map(idx => (
          <div
            key={idx}
            className="rpg-card"
            style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              minHeight: '135px',
              borderRadius: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Skeleton width="45%" height="16px" variant="text" />
              <Skeleton width="32px" height="32px" variant="rect" borderRadius="8px" />
            </div>
            <Skeleton width="55%" height="32px" variant="text" />
            <Skeleton width="100%" height="6px" borderRadius="4px" />
          </div>
        ))}
      </div>

      {/* 3. Analytics Charts Grid Skeletons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Row 1: Productivity Trends & Completed Categories */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: '1.25rem',
          }}
        >
          <div className="rpg-card" style={{ padding: '1.5rem', minHeight: '260px', display: 'flex', flexDirection: 'column', gap: '1rem', borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Skeleton width="180px" height="20px" />
              <Skeleton width="120px" height="16px" />
            </div>
            <Skeleton width="100%" height="180px" borderRadius="8px" />
          </div>

          <div className="rpg-card" style={{ padding: '1.5rem', minHeight: '260px', display: 'flex', flexDirection: 'column', gap: '1rem', borderRadius: '14px' }}>
            <Skeleton width="180px" height="20px" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <Skeleton width="140px" height="140px" variant="circle" />
            </div>
          </div>
        </div>

        {/* Row 2: Vibe Score & Heatmap */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: '1.25rem',
          }}
        >
          <div className="rpg-card" style={{ padding: '1.5rem', minHeight: '220px', display: 'flex', flexDirection: 'column', gap: '1rem', borderRadius: '14px' }}>
            <Skeleton width="160px" height="20px" />
            <Skeleton width="100%" height="140px" borderRadius="8px" />
          </div>

          <div className="rpg-card" style={{ padding: '1.5rem', minHeight: '220px', display: 'flex', flexDirection: 'column', gap: '1rem', borderRadius: '14px' }}>
            <Skeleton width="180px" height="20px" />
            <Skeleton width="100%" height="140px" borderRadius="8px" />
          </div>
        </div>
      </div>

      {/* 4. Disciplines Snapshot Skeletons */}
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <Skeleton width="200px" height="22px" style={{ marginBottom: '0.4rem' }} />
          <Skeleton width="340px" height="16px" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '1rem' }}>
          {[1, 2, 3, 4, 5].map(idx => (
            <div key={idx} className="rpg-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Skeleton width="28px" height="28px" borderRadius="6px" />
                <Skeleton width="70px" height="16px" />
              </div>
              <Skeleton width="90px" height="12px" />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                <Skeleton width="75%" height="6px" borderRadius="3px" />
                <Skeleton width="25px" height="16px" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
