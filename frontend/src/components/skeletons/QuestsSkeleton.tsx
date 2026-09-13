import React from 'react';
import { Skeleton } from './Skeleton';

export const QuestsSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="Loading Quest Board"
      style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      {/* 1. Quest Board Header Banner Skeleton */}
      <div
        className="rpg-card"
        style={{
          padding: 'clamp(1rem, 3vw, 2rem)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, minWidth: '240px' }}>
          <Skeleton width="170px" height="22px" borderRadius="9999px" />
          <Skeleton width="55%" height="34px" borderRadius="6px" />
          <Skeleton width="80%" height="18px" borderRadius="4px" />
        </div>
        <Skeleton width="150px" height="44px" borderRadius="8px" />
      </div>

      {/* 2. 3 Metrics Bar Skeletons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
          gap: '1rem',
        }}
      >
        {[1, 2, 3].map(idx => (
          <div
            key={idx}
            className="rpg-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem 1.25rem',
              borderRadius: '12px',
            }}
          >
            <Skeleton width="40px" height="40px" borderRadius="8px" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
              <Skeleton width="60%" height="14px" />
              <Skeleton width="40%" height="24px" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Search & Filter Toolbar Skeleton */}
      <div
        className="rpg-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.85rem 1.25rem',
          gap: '1rem',
          flexWrap: 'wrap',
          borderRadius: '12px',
        }}
      >
        <Skeleton width="220px" height="38px" borderRadius="8px" />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Skeleton width="70px" height="34px" borderRadius="6px" />
          <Skeleton width="80px" height="34px" borderRadius="6px" />
          <Skeleton width="90px" height="34px" borderRadius="6px" />
        </div>
      </div>

      {/* 4. 4 Quest Card Skeletons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {[1, 2, 3, 4].map(idx => (
          <div
            key={idx}
            className="rpg-card"
            style={{
              padding: '1.25rem',
              minHeight: '110px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.85rem',
              borderRadius: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Skeleton width="24px" height="24px" borderRadius="6px" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
                <Skeleton width="45%" height="20px" />
                <Skeleton width="70%" height="14px" />
              </div>
              <Skeleton width="80px" height="26px" borderRadius="9999px" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Skeleton width="60px" height="20px" borderRadius="4px" />
                <Skeleton width="70px" height="20px" borderRadius="4px" />
              </div>
              <Skeleton width="90px" height="20px" borderRadius="4px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
