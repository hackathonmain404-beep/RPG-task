import React from 'react';
import { Skeleton } from './Skeleton';

export const FeedbackSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="Loading Feedback System"
      style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      {/* Header Skeleton */}
      <div className="rpg-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '14px' }}>
        <Skeleton width="44px" height="44px" borderRadius="10px" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
          <Skeleton width="160px" height="24px" />
          <Skeleton width="220px" height="14px" />
        </div>
      </div>

      {/* Form Card Skeleton */}
      <div className="rpg-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderRadius: '14px' }}>
        <div>
          <Skeleton width="150px" height="14px" style={{ marginBottom: '0.75rem' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))', gap: '0.75rem' }}>
            {[1, 2, 3].map(idx => (
              <div key={idx} className="rpg-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', borderRadius: '10px' }}>
                <Skeleton width="24px" height="24px" variant="circle" />
                <Skeleton width="70px" height="14px" />
                <Skeleton width="50px" height="10px" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <Skeleton width="100px" height="14px" style={{ marginBottom: '0.5rem' }} />
          <Skeleton width="100%" height="130px" borderRadius="10px" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.35rem' }}>
            <Skeleton width="60px" height="12px" />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
          <Skeleton width="80px" height="38px" borderRadius="8px" />
          <Skeleton width="140px" height="40px" borderRadius="8px" />
        </div>
      </div>
    </div>
  );
};
