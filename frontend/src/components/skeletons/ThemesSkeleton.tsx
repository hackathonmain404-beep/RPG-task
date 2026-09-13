import React from 'react';
import { Skeleton } from './Skeleton';

export const ThemesSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="Loading Theme Marketplace"
      className="theme-marketplace-root"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}
    >
      {/* 1. Header & Gold HUD Skeleton */}
      <header className="theme-market-header">
        <div className="theme-market-titles" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Skeleton width="190px" height="20px" borderRadius="9999px" />
          <Skeleton width="280px" height="34px" borderRadius="6px" />
          <Skeleton width="420px" height="16px" borderRadius="4px" />
        </div>
        <div className="theme-market-hud">
          <Skeleton width="130px" height="42px" borderRadius="9999px" />
        </div>
      </header>

      {/* 2. Tabs & Rarity Filter Skeleton */}
      <div className="theme-market-tabs-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <Skeleton width="140px" height="40px" borderRadius="8px" />
          <Skeleton width="150px" height="40px" borderRadius="8px" />
        </div>
        <Skeleton width="150px" height="40px" borderRadius="8px" />
      </div>

      {/* 3. 6 Theme Cards Skeleton */}
      <div className="theme-cards-grid">
        {[1, 2, 3, 4, 5, 6].map(idx => (
          <div
            key={idx}
            className="theme-card-root"
            style={{
              borderRadius: '14px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              minHeight: '340px',
            }}
          >
            {/* Theme Live Preview Window Skeleton */}
            <Skeleton width="100%" height="150px" borderRadius="10px" />

            {/* Title & Rarity Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Skeleton width="50%" height="22px" />
              <Skeleton width="25%" height="18px" borderRadius="4px" />
            </div>

            {/* Description */}
            <Skeleton width="90%" height="14px" />

            {/* Color Swatches Palette */}
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {[1, 2, 3, 4, 5].map(sIdx => (
                <Skeleton key={sIdx} width="22px" height="22px" borderRadius="4px" />
              ))}
            </div>

            {/* Footer Price & Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
              <Skeleton width="30%" height="20px" />
              <Skeleton width="35%" height="34px" borderRadius="8px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
