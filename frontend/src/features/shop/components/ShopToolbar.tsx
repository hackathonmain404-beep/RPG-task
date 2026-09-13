import React from 'react';
import { Search, X, ArrowDownUp } from 'lucide-react';
import { CustomSelect, type SelectOption } from '../../../components/common/CustomSelect';

export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rarity' | 'name';

const SORT_OPTIONS: SelectOption<SortOption>[] = [
  { value: 'default', label: 'Requisition Order' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rarity', label: 'Rarity Tier' },
  { value: 'name', label: 'Alphabetical' },
];

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
        <CustomSelect<SortOption>
          value={sortBy}
          onChange={onSortChange}
          options={SORT_OPTIONS}
          ariaLabel="Sort catalog items"
          variant="gold"
          style={{ minWidth: '175px' }}
        />
      </div>
    </div>
  );
};
