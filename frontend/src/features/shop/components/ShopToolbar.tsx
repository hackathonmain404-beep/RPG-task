import React from 'react';
import { Search, X, ArrowDownUp } from 'lucide-react';

export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rarity' | 'name';

interface ShopToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export const ShopToolbar: React.FC<ShopToolbarProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="armory-toolbar-cluster">
      {/* Search Input */}
      <div className="armory-search-wrap">
        <Search size={14} className="armory-search-icon" aria-hidden="true" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Filter armory..."
          className="armory-search-input"
          aria-label="Filter armory items by keyword"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            style={{
              position: 'absolute',
              right: '0.5rem',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-tertiary, #64748b)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '0.2rem',
            }}
            aria-label="Clear armory search"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Sort Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <ArrowDownUp size={14} color="var(--text-tertiary, #64748b)" aria-hidden="true" />
        <select
          value={sortBy}
          onChange={e => onSortChange(e.target.value as SortOption)}
          className="armory-sort-select"
          aria-label="Sort catalog items"
        >
          <option value="default">Requisition Order</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rarity">Rarity Tier</option>
          <option value="name">Alphabetical</option>
        </select>
      </div>
    </div>
  );
};
