import React from 'react';
import { PackageOpen, RotateCcw } from 'lucide-react';

interface ShopEmptyStateProps {
  onResetFilters: () => void;
  isFiltered: boolean;
}

export const ShopEmptyState: React.FC<ShopEmptyStateProps> = ({
  onResetFilters,
  isFiltered,
}) => {
  return (
    <div
      className="rpg-card"
      style={{
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        backgroundColor: 'rgba(15, 22, 34, 0.7)',
        border: '1px dashed rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.25rem',
        }}
      >
        <PackageOpen size={30} color="var(--text-tertiary, #64748b)" />
      </div>

      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, color: '#38bdf8' }}>
        Armory Empty
      </div>

      <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary, #f8fafc)', margin: 0, fontWeight: 700 }}>
        Nothing is available in this category yet.
      </h3>

      <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary, #94a3b8)', maxWidth: '440px', margin: 0, lineHeight: 1.5 }}>
        Requisitions rotate as new season milestones and Citadel rewards unlock. Check back soon or reset your category filters.
      </p>

      {isFiltered && (
        <button
          type="button"
          onClick={onResetFilters}
          className="rpg-button secondary"
          style={{
            marginTop: '0.75rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.55rem 1.15rem',
            fontSize: '0.85rem',
          }}
        >
          <RotateCcw size={15} />
          <span>View All Requisitions</span>
        </button>
      )}
    </div>
  );
};
