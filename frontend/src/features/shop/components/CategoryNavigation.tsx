import React from 'react';
import type { ShopItem } from '../../../types/contract';
import { Sparkles, Palette, Award, Crown, UserCheck } from 'lucide-react';

interface CategoryNavigationProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  shopItems: ShopItem[];
}

export const CATEGORIES = [
  { id: 'all', label: 'All Items', icon: Sparkles },
  { id: 'avatar', label: 'Avatars', icon: UserCheck },
  { id: 'theme', label: 'Themes', icon: Palette },
  { id: 'badge', label: 'Badges', icon: Award },
  { id: 'title', label: 'Titles', icon: Crown },
];

export const CategoryNavigation: React.FC<CategoryNavigationProps> = ({
  selectedCategory,
  onSelectCategory,
  shopItems,
}) => {
  const getCategoryCount = (catId: string) => {
    if (catId === 'all') return shopItems.length;
    return shopItems.filter(
      item => {
        const itemTypeLower = (item.itemType || '').toLowerCase();
        const itemIdLower = (item.id || '').toLowerCase();
        const itemCatLower = (item.category || '').toLowerCase();
        if (catId === 'avatar') {
          return itemTypeLower === 'avatar' || itemCatLower === 'avatar' || itemIdLower.startsWith('avatar_');
        }
        return itemTypeLower === catId.toLowerCase() || itemCatLower === catId.toLowerCase();
      }
    ).length;
  };

  return (
    <nav aria-label="Shop Categories" className="armory-categories-nav">
      {CATEGORIES.map(cat => {
        const isSelected = selectedCategory === cat.id;
        const Icon = cat.icon;
        const count = getCategoryCount(cat.id);

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`armory-cat-tab ${isSelected ? 'active' : ''}`}
            aria-label={cat.label}
            aria-pressed={isSelected}
          >
            <Icon size={14} aria-hidden="true" />
            <span>{cat.label}</span>
            {count > 0 && (
              <span className="armory-cat-count" aria-hidden="true">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
