import React, { useState } from 'react';
import type { ShopItem } from '../../../types/contract';
import { resolveItemImageUrl } from '../utils/itemImageResolver';

interface ItemVisualPreviewProps {
  item: ShopItem;
  className?: string;
  style?: React.CSSProperties;
}

export const ItemVisualPreview: React.FC<ItemVisualPreviewProps> = ({ item, className, style }) => {
  const [hasImageError, setHasImageError] = useState(false);
  const imageUrl = resolveItemImageUrl(item);

  // Fallback state when an item genuinely has no image or image failed to load
  if (!imageUrl || hasImageError) {
    return (
      <div
        className={`armory-image-fallback ${className || ''}`}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#080c14',
          ...style,
        }}
        aria-hidden="true"
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={item.name || 'Armory Item'}
      className={`armory-item-image ${className || ''}`}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        display: 'block',
        ...style,
      }}
      loading="lazy"
      onError={() => setHasImageError(true)}
    />
  );
};
