import React from 'react';
import { Skeleton } from './Skeleton';

export const InventorySkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="Loading Vault Inventory"
      style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      {/* 1. Header Banner & Active Equipment Bar Skeleton */}
      <header
        className="rpg-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
          flexWrap: 'wrap',
          padding: 'clamp(1rem, 3vw, 1.5rem)',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', flex: 1, minWidth: '240px' }}>
          <Skeleton width="56px" height="56px" borderRadius="14px" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
            <Skeleton width="60%" height="30px" />
            <Skeleton width="80%" height="16px" />
          </div>
        </div>

        {/* Equipped Theme Status Strip Skeleton */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Skeleton width="220px" height="48px" borderRadius="10px" />
          <Skeleton width="42px" height="42px" borderRadius="8px" />
        </div>
      </header>

      {/* 2. Category Filter Tabs Skeleton */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[1, 2, 3, 4, 5].map(idx => (
          <Skeleton key={idx} width="90px" height="38px" borderRadius="8px" />
        ))}
      </div>

      {/* 3. 6 Inventory Item Cards Skeleton */}
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
              height: '190px',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <Skeleton width="65px" height="14px" />
                <Skeleton width="55px" height="16px" borderRadius="4px" />
              </div>
              <Skeleton width="70%" height="20px" style={{ marginBottom: '0.5rem' }} />
              <Skeleton width="90%" height="14px" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
              <Skeleton width="35%" height="14px" />
              <Skeleton width="28%" height="32px" borderRadius="8px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
