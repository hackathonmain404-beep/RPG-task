import React from 'react';

export const ShopLoadingState: React.FC = () => {
  return (
    <div className="armory-grid" aria-label="Loading Armory Catalog" aria-busy="true">
      {[1, 2, 3, 4, 5, 6].map(idx => (
        <div
          key={idx}
          className="rpg-card"
          style={{
            height: '280px',
            borderRadius: '14px',
            backgroundColor: '#0f1622',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            padding: '1.15rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Skeleton Visual Box */}
          <div
            className="rpg-skeleton"
            style={{ height: '140px', width: '100%', borderRadius: '10px' }}
          />

          {/* Skeleton Title & Desc */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
            <div className="rpg-skeleton" style={{ height: '20px', width: '60%', borderRadius: '4px' }} />
            <div className="rpg-skeleton" style={{ height: '14px', width: '90%', borderRadius: '4px' }} />
          </div>

          {/* Skeleton Price & Action */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '0.75rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div className="rpg-skeleton" style={{ height: '18px', width: '35%', borderRadius: '4px' }} />
            <div className="rpg-skeleton" style={{ height: '32px', width: '30%', borderRadius: '8px' }} />
          </div>
        </div>
      ))}
    </div>
  );
};
