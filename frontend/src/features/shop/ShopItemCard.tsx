import React from 'react';
import type { ShopItem } from '../../types/contract';
import { Palette, Shield, Award, Crown, Coins, Check, Sparkles, Loader2 } from 'lucide-react';

interface ShopItemCardProps {
  item: ShopItem;
  isOwned: boolean;
  isEquipped: boolean;
  isPending: boolean;
  onInitiatePurchase: (item: ShopItem) => void;
  onEquip?: (item: ShopItem) => void;
}

const TYPE_ICONS: Record<string, React.FC<{ size?: number; color?: string }>> = {
  theme: Palette,
  frame: Shield,
  badge: Award,
  title: Crown,
};

const RARITY_COLORS: Record<string, { badgeBg: string; textColor: string; label: string }> = {
  common: { badgeBg: 'rgba(148, 163, 184, 0.15)', textColor: '#94a3b8', label: 'Common' },
  rare: { badgeBg: 'rgba(59, 130, 246, 0.15)', textColor: '#38bdf8', label: 'Rare' },
  epic: { badgeBg: 'rgba(168, 85, 247, 0.15)', textColor: '#c084fc', label: 'Epic' },
  legendary: { badgeBg: 'rgba(245, 158, 11, 0.15)', textColor: '#fde047', label: 'Legendary' },
};

export const ShopItemCard: React.FC<ShopItemCardProps> = ({
  item,
  isOwned,
  isEquipped,
  isPending,
  onInitiatePurchase,
  onEquip,
}) => {
  const Icon = TYPE_ICONS[item.itemType.toLowerCase()] || Sparkles;
  const rarity = RARITY_COLORS[item.rarity.toLowerCase()] || RARITY_COLORS.common;

  return (
    <div
      className={`rpg-card rarity-${item.rarity.toLowerCase()}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.25rem',
        borderRadius: '12px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        position: 'relative',
        gap: '1rem',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <div>
        {/* Top Header: Type & Rarity Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-tertiary)',
            }}
          >
            <Icon size={14} color="var(--text-tertiary)" />
            {item.itemType}
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '0.2rem 0.55rem',
              borderRadius: '4px',
              backgroundColor: rarity.badgeBg,
              color: rarity.textColor,
            }}
          >
            {rarity.label}
          </span>
        </div>

        {/* Item Title */}
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.35rem', color: 'var(--text-primary)' }}>
          {item.name}
        </h3>

        {/* Lore / Description */}
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, minHeight: '2.5rem', lineHeight: 1.4 }}>
          {item.description}
        </p>
      </div>

      {/* Bottom Section: Price & Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.85rem',
          borderTop: '1px solid var(--border-subtle)',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-gold)' }}>
          <Coins size={18} />
          <span className="mono-numbers" style={{ fontSize: '1.25rem', fontWeight: 900 }}>
            {item.price.toLocaleString()}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Gold</span>
        </div>

        <div>
          {isEquipped ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--status-success)',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <Check size={16} />
              Equipped
            </span>
          ) : isOwned ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--text-tertiary)',
                  padding: '0.4rem 0.6rem',
                }}
              >
                Owned
              </span>
              {onEquip && (
                <button
                  type="button"
                  onClick={() => onEquip(item)}
                  disabled={isPending}
                  className="rpg-button secondary"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                  aria-label={`Equip ${item.name}`}
                >
                  {isPending ? <Loader2 size={14} className="animate-spin" /> : 'Equip'}
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onInitiatePurchase(item)}
              disabled={isPending}
              className="rpg-button primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 700,
              }}
              aria-label={`Purchase ${item.name} for ${item.price} Gold`}
              aria-busy={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Acquire</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
