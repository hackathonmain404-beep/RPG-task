import React from 'react';
import { Skeleton } from './Skeleton';

export const ShopSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="Loading Citadel Armory"
      style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      {/* 1. Armory Hero & Treasury Skeleton */}
      <div
        className="rpg-card"
        style={{
          padding: 'clamp(1rem, 3vw, 1.75rem)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1, minWidth: '240px' }}>
          <Skeleton width="180px" height="22px" borderRadius="9999px" />
          <Skeleton width="50%" height="32px" borderRadius="6px" />
          <Skeleton width="75%" height="16px" borderRadius="4px" />
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Skeleton width="140px" height="50px" borderRadius="10px" />
          <Skeleton width="42px" height="42px" borderRadius="8px" />
        </div>
      </div>

      {/* 2. Category Navigation & Toolbar Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[1, 2, 3, 4, 5].map(idx => (
            <Skeleton key={idx} width="85px" height="38px" borderRadius="8px" />
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Skeleton width="160px" height="38px" borderRadius="8px" />
          <Skeleton width="130px" height="38px" borderRadius="8px" />
        </div>
      </div>

      {/* 3. 6 Armory Item Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
          gap: '1.25rem',
        }}
      >
        {[1, 2, 3, 4, 5, 6].map(idx => (
          <div
            key={idx}
            className="rpg-card"
            style={{
              height: '280px',
              borderRadius: '14px',
              padding: '1.15rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Skeleton width="100%" height="135px" borderRadius="10px" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Skeleton width="55%" height="18px" />
                <Skeleton width="25%" height="16px" borderRadius="4px" />
              </div>
              <Skeleton width="85%" height="14px" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
              <Skeleton width="35%" height="18px" />
              <Skeleton width="30%" height="32px" borderRadius="8px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
