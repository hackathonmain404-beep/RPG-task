import React from 'react';
import { Skeleton } from './Skeleton';

export const CharacterSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="Loading Character Sheet"
      style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      {/* 1. Character Hero Header Skeleton */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', flex: 1 }}>
          <Skeleton width="76px" height="76px" borderRadius="16px" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Skeleton width="180px" height="28px" />
              <Skeleton width="70px" height="24px" borderRadius="9999px" />
            </div>
            <Skeleton width="240px" height="16px" />
          </div>
        </div>
        <Skeleton width="120px" height="42px" borderRadius="8px" />
      </header>

      {/* 2. Core Vitals Grid (3 cards) */}
      <section aria-label="Core Character Metrics">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: '1.25rem',
          }}
        >
          {[1, 2, 3].map(idx => (
            <div
              key={idx}
              className="rpg-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                padding: '1.25rem',
                borderRadius: '12px',
                minHeight: '160px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Skeleton width="120px" height="18px" />
                <Skeleton width="60px" height="22px" borderRadius="4px" />
              </div>
              <Skeleton width="45%" height="36px" />
              <Skeleton width="100%" height="10px" borderRadius="5px" />
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
                <Skeleton width="35%" height="14px" />
                <Skeleton width="25%" height="14px" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Five Core Attributes Section Skeleton */}
      <section>
        <div style={{ marginBottom: '1.25rem' }}>
          <Skeleton width="220px" height="26px" style={{ marginBottom: '0.35rem' }} />
          <Skeleton width="380px" height="16px" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3, 4, 5].map(idx => (
            <div
              key={idx}
              className="rpg-card"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                borderRadius: '12px',
                minHeight: '90px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1 }}>
                  <Skeleton width="42px" height="42px" borderRadius="10px" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Skeleton width="100px" height="20px" />
                      <Skeleton width="60px" height="18px" borderRadius="4px" />
                    </div>
                    <Skeleton width="65%" height="14px" />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                  <Skeleton width="35px" height="12px" />
                  <Skeleton width="45px" height="24px" />
                </div>
              </div>
              <Skeleton width="100%" height="8px" borderRadius="4px" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
