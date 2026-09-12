import React from 'react';
import { Shield, Loader2 } from 'lucide-react';

export const RouteLoadingFallback: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="Loading Citadel page content"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        padding: '3rem 1.5rem',
        gap: '1.25rem',
        color: 'var(--text-secondary)',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          backgroundColor: 'rgba(56, 189, 248, 0.12)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(56, 189, 248, 0.2)',
        }}
      >
        <Shield size={28} color="#38bdf8" className="animate-pulse" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.95rem', fontWeight: 600 }}>
        <Loader2 size={18} className="animate-spin" color="#38bdf8" />
        <span>Synchronizing Citadel chamber...</span>
      </div>
    </div>
  );
};
