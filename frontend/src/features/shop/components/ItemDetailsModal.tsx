import React, { useEffect, useRef } from 'react';
import type { ShopItem } from '../../../types/contract';
import { ItemVisualPreview } from './ItemVisualPreview';
import { Coins, X, Check, Loader2, Sparkles } from 'lucide-react';

interface ItemDetailsModalProps {
  item: ShopItem | null;
  isOpen: boolean;
  isOwned: boolean;
  isEquipped: boolean;
  isPending: boolean;
  playerGold: number;
  onClose: () => void;
  onInitiatePurchase: (item: ShopItem) => void;
  onEquip?: (item: ShopItem) => void;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  item,
  isOpen,
  isOwned,
  isEquipped,
  isPending,
  playerGold,
  onClose,
  onInitiatePurchase,
  onEquip,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const hasEnoughGold = playerGold >= (item.price || 0);
  const rarityKey = (item.rarity || 'common').toLowerCase();

  return (
    <div
      className="armory-modal-backdrop"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-details-title"
        className="armory-modal-dialog"
      >
        {/* Header with Title and Close Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
              <span className={`armory-tag-rarity ${rarityKey}`}>
                {item.rarity}
              </span>
              <span className="armory-tag-type">
                {item.itemType}
              </span>
            </div>
            <h2
              id="item-details-title"
              style={{
                fontSize: '1.45rem',
                fontWeight: 800,
                color: 'var(--text-primary, #f8fafc)',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {item.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: 'var(--text-secondary, #94a3b8)',
              cursor: 'pointer',
              padding: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close item details"
          >
            <X size={18} />
          </button>
        </div>

        {/* Visual Preview Showcase */}
        <div
          style={{
            height: '180px',
            backgroundColor: '#080c14',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <ItemVisualPreview item={item} />
        </div>

        {/* Item Lore & Description */}
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'rgba(15, 20, 28, 0.6)',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary, #64748b)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
            Requisition Archive Lore
          </div>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary, #94a3b8)', margin: 0, lineHeight: 1.5 }}>
            {item.description}
          </p>
        </div>

        {/* Price & Current Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--color-gold, #f59e0b)' }}>
            <Coins size={22} />
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary, #64748b)', textTransform: 'uppercase', fontWeight: 700 }}>
                Citadel Price
              </div>
              <div className="mono-numbers" style={{ fontSize: '1.35rem', fontWeight: 900 }}>
                {item.price.toLocaleString()} <span style={{ fontSize: '0.8rem', color: '#fde68a' }}>Gold</span>
              </div>
            </div>
          </div>

          <div>
            {isEquipped ? (
              <span className="armory-badge-equipped">
                <Check size={16} />
                Equipped Active
              </span>
            ) : isOwned ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="armory-badge-owned">Owned</span>
                {onEquip && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEquip(item);
                    }}
                    disabled={isPending}
                    className="armory-btn-equip"
                  >
                    {isPending ? <Loader2 size={14} className="sync-icon-spinning" /> : 'Equip Cosmetic'}
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onInitiatePurchase(item);
                }}
                disabled={isPending}
                className={`armory-btn-acquire ${!hasEnoughGold ? 'insufficient-funds' : ''}`}
                aria-label={`Purchase ${item.name} for ${item.price} Gold`}
              >
                {isPending ? (
                  <>
                    <Loader2 size={14} className="sync-icon-spinning" />
                    <span>Processing...</span>
                  </>
                ) : !hasEnoughGold ? (
                  <span>Need More Gold</span>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Acquire Item</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
