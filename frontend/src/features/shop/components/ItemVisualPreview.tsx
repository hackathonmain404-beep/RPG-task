import React from 'react';
import type { ShopItem } from '../../../types/contract';
import { Shield, Sparkles, User, Terminal } from 'lucide-react';

interface ItemVisualPreviewProps {
  item: ShopItem;
}

export const ItemVisualPreview: React.FC<ItemVisualPreviewProps> = ({ item }) => {
  const type = item.itemType.toLowerCase();
  const id = item.id.toLowerCase();
  const sku = (item.sku || '').toLowerCase();

  // 1. THEME PREVIEW
  if (type === 'theme' || id.startsWith('theme_') || sku.startsWith('theme_')) {
    let accent1 = '#38bdf8';
    let accent2 = '#a855f7';
    let accent3 = '#0284c7';

    if (id.includes('neon') || id.includes('cyber')) {
      accent1 = '#ec4899';
      accent2 = '#38bdf8';
      accent3 = '#8b5cf6';
    } else if (id.includes('mystic') || id.includes('lofi')) {
      accent1 = '#10b981';
      accent2 = '#34d399';
      accent3 = '#059669';
    } else if (id.includes('retro') || id.includes('solaris') || id.includes('gold')) {
      accent1 = '#f59e0b';
      accent2 = '#fbbf24';
      accent3 = '#d97706';
    }

    return (
      <div
        className="preview-theme-terminal"
        style={{
          ['--theme-accent' as any]: accent1,
          ['--theme-glow' as any]: `${accent1}44`,
        }}
      >
        <div className="preview-theme-header">
          <div className="preview-terminal-dot" style={{ backgroundColor: '#ef4444' }} />
          <div className="preview-terminal-dot" style={{ backgroundColor: '#f59e0b' }} />
          <div className="preview-terminal-dot" style={{ backgroundColor: '#10b981' }} />
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.2rem', opacity: 0.5 }}>
            <Terminal size={10} color={accent1} />
            <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono, monospace)', color: accent1 }}>
              UI_PALETTE
            </span>
          </div>
        </div>

        {/* Abstract Theme Swatches */}
        <div className="preview-theme-swatches">
          <div className="preview-theme-chip" style={{ backgroundColor: accent1 }} />
          <div className="preview-theme-chip" style={{ backgroundColor: accent2 }} />
          <div className="preview-theme-chip" style={{ backgroundColor: accent3 }} />
        </div>

        {/* Cyber wave lines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', opacity: 0.6 }}>
          <div style={{ height: '3px', width: '70%', backgroundColor: accent1, borderRadius: '2px' }} />
          <div style={{ height: '3px', width: '45%', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '2px' }} />
        </div>
      </div>
    );
  }

  // 2. AVATAR FRAME PREVIEW
  if (type === 'frame' || id.startsWith('frame_') || sku.startsWith('frame_')) {
    const isGold = id.includes('gold') || item.rarity === 'legendary' || item.rarity === 'epic';
    const ringColor = isGold ? '#f59e0b' : '#38bdf8';

    return (
      <div className="preview-frame-shield" style={{ borderColor: `${ringColor}88` }}>
        <div className="preview-frame-inner-ring" style={{ borderColor: `${ringColor}55` }}>
          <User size={28} color="rgba(255, 255, 255, 0.35)" />
        </div>
        <div
          style={{
            position: 'absolute',
            top: '-5px',
            background: ringColor,
            borderRadius: '50%',
            width: '10px',
            height: '10px',
            boxShadow: `0 0 10px ${ringColor}`,
          }}
        />
      </div>
    );
  }

  // 3. BADGE PREVIEW
  if (type === 'badge' || id.startsWith('badge_') || sku.startsWith('badge_')) {
    return (
      <div className="preview-badge-insignia">
        <div className="preview-badge-content">
          <Shield size={26} color="var(--color-gold, #f59e0b)" />
        </div>
      </div>
    );
  }

  // 4. TITLE PREVIEW
  if (type === 'title' || id.startsWith('title_') || sku.startsWith('title_')) {
    return (
      <div className="preview-title-banner">
        <div style={{ fontSize: '0.62rem', letterSpacing: '0.15em', color: 'var(--text-tertiary, #64748b)', marginBottom: '0.15rem' }}>
          « CITADEL TITLE »
        </div>
        <div className="preview-title-text">
          {item.name.replace(/Title/gi, '').trim() || item.name}
        </div>
      </div>
    );
  }

  // 5. GENERIC COSMETIC / AVATAR PREVIEW
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.45rem',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5)',
        }}
      >
        <Sparkles size={24} color="var(--color-gold, #f59e0b)" />
      </div>
      <span style={{ fontSize: '0.68rem', letterSpacing: '0.08em', color: 'var(--text-tertiary, #64748b)', textTransform: 'uppercase' }}>
        Cosmetic Relic
      </span>
    </div>
  );
};
