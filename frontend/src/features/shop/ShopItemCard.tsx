import React, { useRef, useState, useCallback } from 'react';
import type { ShopItem } from '../../types/contract';
import { ItemVisualPreview } from './components/ItemVisualPreview';
import { 
  Coins, 
  Check, 
  Loader2, 
  Sparkles, 
  Palette, 
  Shield, 
  Award, 
  Crown,
  Info
} from 'lucide-react';

export interface ShopItemCardProps {
  item: ShopItem;
  isOwned: boolean;
  isEquipped: boolean;
  isPending: boolean;
  playerGold?: number;
  isJustAcquired?: boolean;
  onInitiatePurchase: (item: ShopItem) => void;
  onEquip?: (item: ShopItem) => void;
  onInspect?: (item: ShopItem) => void;
  index?: number;
}

const TYPE_ICONS: Record<string, React.FC<{ size?: number; color?: string; className?: string }>> = {
  theme: Palette,
  frame: Shield,
  badge: Award,
  title: Crown,
  cosmetic: Sparkles,
};

const RARITY_LABELS: Record<string, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

export const ShopItemCard: React.FC<ShopItemCardProps> = ({
  item,
  isOwned,
  isEquipped,
  isPending,
  playerGold = 0,
  isJustAcquired = false,
  onInitiatePurchase,
  onEquip,
  onInspect,
  index = 0,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});

  const typeKey = (item.itemType || '').toLowerCase();
  const Icon = TYPE_ICONS[typeKey] || Sparkles;
  const rarityKey = (item.rarity || 'common').toLowerCase();
  const rarityLabel = RARITY_LABELS[rarityKey] || (item.rarity ? item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1) : 'Common');

  const price = typeof item.price === 'number' ? item.price : 0;
  const hasEnoughGold = playerGold >= price;

  // 3D Perspective Tilt and Cursor-following Lighting (Desktop only)
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Gentle 2.2 degrees max tilt for refined physical feel
    const rotateX = ((centerY - y) / centerY) * 2.2;
    const rotateY = ((x - centerX) / centerX) * 2.2;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px) scale(1.012)`,
      ['--mouse-x' as any]: `${x}px`,
      ['--mouse-y' as any]: `${y}px`,
    });
  }, []);

  const handleMouseLeave = () => {
    // Clearing transform allows CSS transition to smoothly glide card back to resting position
    setTiltStyle({
      ['--mouse-x' as any]: '50%',
      ['--mouse-y' as any]: '50%',
    });
  };

  const animationDelayStyle = {
    animationDelay: `${Math.min(index * 35, 280)}ms`,
    ['--stagger-index' as any]: index,
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`armory-card armory-card-anim rarity-${rarityKey} ${isJustAcquired ? 'purchase-success-active' : ''}`}
      style={{
        ...tiltStyle,
        ...animationDelayStyle,
      }}
      tabIndex={0}
      role="region"
      aria-label={`${item.name}, ${rarityLabel} ${item.itemType}, ${item.price} Gold`}
      onKeyDown={e => {
        if (e.key === 'Enter' && onInspect && e.target === e.currentTarget) {
          onInspect(item);
        }
      }}
    >
      {/* Interactive Cursor-following Spotlight Overlay */}
      <div className="armory-card-spotlight" aria-hidden="true" />

      <div>
        {/* Upper Visual Presentation Area */}
        <div
          className="armory-visual-container"
          onClick={() => onInspect?.(item)}
          title="Click to inspect item details"
        >
          {/* Top Tags Overlay: Type & Rarity */}
          <div className="armory-card-tags-overlay">
            <span className="armory-tag-type">
              <Icon size={12} color="var(--text-tertiary, #64748b)" aria-hidden="true" />
              <span>{item.itemType}</span>
            </span>

            <span className={`armory-tag-rarity ${rarityKey}`}>
              {rarityLabel}
            </span>
          </div>

          {/* Real Item Image Presentation */}
          <ItemVisualPreview item={item} />
        </div>

        {/* Item Title & Lore Body */}
        <div className="armory-card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <h3 className="armory-item-title">
              {item.name}
            </h3>
            {onInspect && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onInspect(item);
                }}
                className="armory-btn-inspect-icon"
                title="View item lore & specifications"
                aria-label={`Inspect ${item.name}`}
              >
                <Info size={16} />
              </button>
            )}
          </div>

          <p className="armory-item-desc" title={item.description}>
            {item.description}
          </p>
        </div>
      </div>

      {/* Card Footer: Price & Primary Action */}
      <div className="armory-card-footer">
        {/* Authoritative Price Display */}
        <div className="armory-price-box" aria-label={`Price: ${price} Gold`}>
          <Coins size={18} aria-hidden="true" />
          <span className="armory-price-num mono-numbers">
            {price.toLocaleString()}
          </span>
          <span className="armory-price-unit">Gold</span>
        </div>

        {/* Action States */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isEquipped ? (
            <span className="armory-badge-equipped">
              <Check size={14} aria-hidden="true" />
              <span>Equipped</span>
            </span>
          ) : isOwned ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span className="armory-badge-owned">
                Owned
              </span>
              {onEquip && (
                <button
                  type="button"
                  onClick={() => onEquip(item)}
                  disabled={isPending}
                  className="armory-btn-equip"
                  aria-label={`Equip ${item.name}`}
                >
                  {isPending ? (
                    <Loader2 size={14} className="sync-icon-spinning" aria-hidden="true" />
                  ) : (
                    <span>Equip</span>
                  )}
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onInitiatePurchase(item)}
              disabled={isPending}
              className={`armory-btn-acquire ${!hasEnoughGold && !isPending ? 'insufficient-funds' : ''}`}
              aria-label={`Purchase ${item.name} for ${price} Gold`}
              aria-busy={isPending}
              title={!hasEnoughGold ? 'Earn more Gold in Citadel Quests to acquire this item.' : undefined}
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="sync-icon-spinning" aria-hidden="true" />
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
