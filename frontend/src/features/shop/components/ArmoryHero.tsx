import React from 'react';
import { Store, ShieldCheck } from 'lucide-react';

interface ArmoryHeroProps {
  itemCount: number;
}

export const ArmoryHero: React.FC<ArmoryHeroProps> = ({ itemCount }) => {
  return (
    <div className="armory-hero-left">
      <div className="armory-hero-icon-box">
        <div className="armory-hero-icon-pulse" />
        <Store size={30} color="var(--color-gold, #f59e0b)" />
      </div>

      <div>
        <div className="armory-eyebrow">
          <span className="armory-status-dot" aria-hidden="true" />
          <span>Citadel Armory</span>
          <span style={{ opacity: 0.4 }}>•</span>
          <span style={{ color: 'var(--text-tertiary, #64748b)' }}>System Online</span>
          {itemCount > 0 && (
            <>
              <span style={{ opacity: 0.4 }}>•</span>
              <span style={{ color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <ShieldCheck size={12} />
                {itemCount} Items Available
              </span>
            </>
          )}
        </div>

        <h1 className="armory-title">
          The Citadel Armory
        </h1>

        <p className="armory-subtitle">
          Acquire cosmetic themes, avatar frames, and milestone relics verified by the backend.
        </p>
      </div>
    </div>
  );
};
