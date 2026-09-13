import React, { useState } from 'react';
import { Coins, Check, Loader2, Sparkles } from 'lucide-react';
import type { Theme } from '../types';
import { ThemePreview } from './ThemePreview';
import { RarityBadge } from './RarityBadge';

interface ThemeCardProps {
  theme: Theme;
  isOwned: boolean;
  isEquipped: boolean;
  playerGold?: number;
  isAuthenticated?: boolean;
  onAcquire: (theme: Theme) => Promise<void>;
  onEquip: (theme: Theme) => Promise<void>;
  onRequireAuth?: () => void;
  index?: number;
}

export const ThemeCard: React.FC<ThemeCardProps> = ({
  theme,
  isOwned,
  isEquipped,
  playerGold = 0,
  isAuthenticated = false,
  onAcquire,
  onEquip,
  onRequireAuth,
  index = 0,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const hasEnoughGold = playerGold >= theme.price;

  const handleAction = async () => {
    if (isProcessing) return;

    if (!isOwned) {
      if (!isAuthenticated) {
        if (onRequireAuth) onRequireAuth();
        return;
      }
      if (!hasEnoughGold) return;

      try {
        setIsProcessing(true);
        await onAcquire(theme);
      } finally {
        setIsProcessing(false);
      }
    } else if (!isEquipped) {
      try {
        setIsProcessing(true);
        await onEquip(theme);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const staggerDelay = `${Math.min(index * 40, 300)}ms`;

  return (
    <div
      className={`theme-card armory-card-anim rarity-${theme.rarity} ${isEquipped ? 'theme-card-active' : ''}`}
      style={{ animationDelay: staggerDelay }}
    >
      {/* Visual Theme Preview */}
      <div className="theme-card-visual-wrapper">
        <ThemePreview theme={theme} />
      </div>

      {/* Card Body */}
      <div className="theme-card-body">
        {/* Badges Row */}
        <div className="theme-card-badges-row">
          <span className="theme-badge-category">THEME</span>
          <RarityBadge rarity={theme.rarity} />
        </div>

        {/* Title & Description */}
        <h3 className="theme-card-title">{theme.name}</h3>
        <p className="theme-card-description">{theme.description}</p>

        {/* Footer: Price & Action */}
        <div className="theme-card-footer">
          {/* Price */}
          {theme.price === 0 ? (
            <div className="theme-card-price-group" style={{ color: 'var(--status-success, #10b981)' }}>
              <Sparkles size={16} className="theme-gold-icon" />
              <span className="theme-gold-val" style={{ fontSize: '0.85rem', letterSpacing: '0.04em' }}>FREE</span>
              <span className="theme-gold-lbl" style={{ color: '#34d399' }}>STARTER</span>
            </div>
          ) : (
            <div className="theme-card-price-group">
              <Coins size={16} className="theme-gold-icon" />
              <span className="theme-gold-val">{theme.price}</span>
              <span className="theme-gold-lbl">GOLD</span>
            </div>
          )}

          {/* Action Button */}
          <div className="theme-card-action">
            {isEquipped ? (
              <button
                type="button"
                className="theme-btn theme-btn-equipped"
                disabled
              >
                <Check size={14} className="inline-icon" />
                Equipped
              </button>
            ) : isOwned ? (
              <button
                type="button"
                className="theme-btn theme-btn-equip"
                onClick={handleAction}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={14} className="spin-icon" />
                    Equipping...
                  </>
                ) : (
                  'Equip'
                )}
              </button>
            ) : (
              <button
                type="button"
                className={`theme-btn theme-btn-acquire ${!hasEnoughGold ? 'insufficient-gold' : ''}`}
                onClick={handleAction}
                disabled={isProcessing || !hasEnoughGold}
                title={!isAuthenticated ? 'Log in to acquire' : !hasEnoughGold ? 'Not enough Gold' : undefined}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={14} className="spin-icon" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="inline-icon" />
                    Acquire
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
