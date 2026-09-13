import React from 'react';
import { getRarityConfig } from '../rarity';

interface RarityBadgeProps {
  rarity: string;
  className?: string;
}

export const RarityBadge: React.FC<RarityBadgeProps> = ({ rarity, className = '' }) => {
  const config = getRarityConfig(rarity);

  return (
    <span
      className={`theme-rarity-badge ${className}`}
      style={{
        color: config.text,
        borderColor: config.border,
        backgroundColor: config.bg,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: '6px',
        padding: '0.2rem 0.6rem',
        fontSize: '0.72rem',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        display: 'inline-flex',
        alignItems: 'center',
        lineHeight: 1.2,
      }}
    >
      {config.label}
    </span>
  );
};
