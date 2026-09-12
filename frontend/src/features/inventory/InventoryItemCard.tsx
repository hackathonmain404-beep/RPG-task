import React from 'react';
import type { InventoryItem } from '../../types/contract';
import { Palette, Shield, Award, Crown, Check, Loader2, Sparkles } from 'lucide-react';

interface InventoryItemCardProps {
  item: InventoryItem;
  isEquipped: boolean;
  isPending: boolean;
  onEquip: (itemId: string) => void;
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

export const InventoryItemCard: React.FC<InventoryItemCardProps> = ({
  item,
  isEquipped,
  isPending,
  onEquip,
}) => {
  const shopItem = item.shopItem;
  const itemType = shopItem?.itemType || (item.itemId?.startsWith('theme_') ? 'theme' : 'item');
  const itemName = shopItem?.name || item.itemId || item.shopItemId;
  const itemDesc = shopItem?.description || 'Citadel adventurer inventory cosmetic.';
  const itemRarity = shopItem?.rarity || 'common';

  const Icon = TYPE_ICONS[itemType.toLowerCase()] || Sparkles;
  const rarity = RARITY_COLORS[itemRarity.toLowerCase()] || RARITY_COLORS.common;
  const targetId = item.itemId || item.shopItemId;

  return (
    <div
      className={`rpg-card rarity-${itemRarity.toLowerCase()}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.25rem',
        borderRadius: '12px',
        backgroundColor: 'var(--bg-surface)',
        border: isEquipped ? '2px solid var(--border-focus)' : '1px solid var(--border-subtle)',
        boxShadow: isEquipped ? '0 0 16px rgba(56, 189, 248, 0.25)' : undefined,
        gap: '1rem',
        transition: 'all 0.2s ease',
      }}
    >
      <div>
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
            {itemType}
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              padding: '0.15rem 0.55rem',
              borderRadius: '4px',
              backgroundColor: rarity.badgeBg,
              color: rarity.textColor,
            }}
          >
            {rarity.label}
          </span>
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.35rem', color: 'var(--text-primary)' }}>
          {itemName}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, minHeight: '2.5rem', lineHeight: 1.4 }}>
          {itemDesc}
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.85rem',
          borderTop: '1px solid var(--border-subtle)',
          gap: '0.75rem',
        }}
      >
        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          {item.purchasedAt ? `Acquired ${new Date(item.purchasedAt).toLocaleDateString()}` : 'Owned Vault Item'}
        </span>

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
              Active
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onEquip(targetId)}
              disabled={isPending}
              className="rpg-button secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 1rem',
                fontSize: '0.85rem',
              }}
              aria-label={`Equip ${itemName}`}
              aria-busy={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Equipping...</span>
                </>
              ) : (
                <span>Equip</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
