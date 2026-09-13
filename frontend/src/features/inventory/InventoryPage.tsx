import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../../context/useShop';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';
import { InventoryItemCard } from './InventoryItemCard';
import { InventorySkeleton } from '../../components/skeletons/InventorySkeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { 
  Package, 
  Palette, 
  RotateCw, 
  AlertCircle, 
  ShoppingBag, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Items' },
  { id: 'theme', label: 'Themes' },
  { id: 'frame', label: 'Frames' },
  { id: 'badge', label: 'Badges' },
  { id: 'title', label: 'Titles' },
  { id: 'consumable', label: 'Consumables & Potions' },
  { id: 'gear', label: 'Gear & Cosmetics' },
];

export const InventoryPage: React.FC = () => {
  useDocumentMetadata('Vault Inventory', { noindex: true });

  const {
    inventory,
    equippedTheme,
    isLoadingInventory,
    inventoryError,
    pendingEquipItemIds,
    equipItem,
    isEquipped,
    loadInventory,
  } = useShop();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [equipMessage, setEquipMessage] = useState<string | null>(null);

  // Automatically refresh user inventory from database on mount
  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  // Filter inventory items by category
  const filteredItems = inventory.filter(item => {
    if (selectedCategory === 'all') return true;
    const targetId = item.itemId || item.shopItemId || '';
    const rawType = (item.shopItem?.itemType || (targetId.startsWith('theme_') ? 'theme' : 'item')).toLowerCase();
    if (selectedCategory === 'consumable') {
      return rawType === 'potion' || rawType === 'consumable';
    }
    if (selectedCategory === 'gear') {
      return !['theme', 'frame', 'badge', 'title', 'potion', 'consumable'].includes(rawType);
    }
    return rawType === selectedCategory.toLowerCase();
  });

  const handleEquip = async (itemId: string) => {
    try {
      await equipItem(itemId);
      const target = inventory.find(i => (i.itemId || i.shopItemId) === itemId);
      const name = target?.shopItem?.name || itemId;
      setEquipMessage(`Equipped ${name}! Visual tokens applied across Citadel.`);
      setTimeout(() => setEquipMessage(null), 4000);
    } catch {
      setEquipMessage(null);
    }
  };

  const getThemeDisplayName = (key: string) => {
    switch (key) {
      case 'neon_outpost': return 'Neon Outpost (Electric Cyan & Fuchsia)';
      case 'mystic_forest': return 'Mystic Forest (Ancient Emerald)';
      case 'solaris_gold': return 'Solaris Gold (Celestial Radiance)';
      default: return 'Dark Citadel (Obsidian Bastion)';
    }
  };

  if (isLoadingInventory && inventory.length === 0) {
    return (
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <InventorySkeleton />
      </div>
    );
  }

  if (inventoryError && inventory.length === 0) {
    return (
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
        <ErrorState
          title="Vault Synchronization Failed"
          message={inventoryError}
          onRetry={() => void loadInventory()}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Header Banner & Active Equipment Bar */}
      <header
        className="rpg-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
          flexWrap: 'wrap',
          padding: 'clamp(1rem, 3vw, 1.5rem)',
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-elevated) 100%)',
          border: '1px solid var(--border-strong)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', minWidth: 0, flex: 1 }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              border: '2px solid rgba(56, 189, 248, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.2)',
              flexShrink: 0,
            }}
          >
            <Package size={28} color="var(--border-focus)" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 style={{ fontSize: 'clamp(1.35rem, 4vw, 1.75rem)', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Adventurer Vault &amp; Inventory
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.2rem 0 0' }}>
              Equip owned cosmetics, HUD themes, avatar frames, and milestone relics.
            </p>
          </div>
        </div>

        {/* Equipped Theme Status Strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', maxWidth: '100%' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.6rem 1.25rem',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-surface-sunken)',
              border: '1px solid var(--border-subtle)',
              maxWidth: '100%',
              flexWrap: 'wrap',
            }}
          >
            <Palette size={20} color="var(--color-xp)" />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
                Equipped Theme
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                {getThemeDisplayName(equippedTheme)}
              </div>
            </div>
          </div>

          <button
            onClick={() => void loadInventory()}
            disabled={isLoadingInventory}
            className="rpg-button secondary"
            style={{ padding: '0.65rem 0.9rem', minHeight: '42px' }}
            aria-label="Refresh inventory"
          >
            <RotateCw size={16} className={isLoadingInventory ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Success Notification */}
      {equipMessage && (
        <div
          role="status"
          aria-live="polite"
          className="rpg-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.25rem',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#a7f3d0',
            fontWeight: 600,
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          <CheckCircle2 size={20} color="var(--status-success)" />
          <span>{equipMessage}</span>
        </div>
      )}

      {/* Recoverable Error Banner */}
      {inventoryError && (
        <div
          role="alert"
          className="rpg-card"
          style={{
            border: '1px solid rgba(239, 68, 68, 0.4)',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            padding: '1rem 1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={22} color="var(--status-danger)" />
            <div>
              <div style={{ fontWeight: 700, color: '#fca5a5' }}>
                Inventory Synchronization Error
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {inventoryError}. Please retry connection to the Citadel database.
              </div>
            </div>
          </div>
          <button
            onClick={() => void loadInventory()}
            className="rpg-button secondary"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* 2. Category Filter Tabs */}
      <nav
        aria-label="Inventory Categories"
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: '4px',
        }}
      >
        {CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className="rpg-button secondary"
              style={{
                padding: '0.55rem 1.1rem',
                fontSize: '0.875rem',
                fontWeight: isSelected ? 700 : 500,
                backgroundColor: isSelected ? 'var(--bg-surface-elevated)' : 'transparent',
                borderColor: isSelected ? 'var(--border-focus)' : 'var(--border-subtle)',
                color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                boxShadow: isSelected ? '0 0 12px rgba(56, 189, 248, 0.2)' : 'none',
                minHeight: '40px',
                whiteSpace: 'nowrap',
              }}
              aria-pressed={isSelected}
            >
              {cat.label}
            </button>
          );
        })}
      </nav>

      {/* 3. Inventory Items Grid */}
      <section aria-label="Owned Items">
        {isLoadingInventory && inventory.length === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: '1.25rem' }}>
            {[1, 2, 3].map(idx => (
              <div key={idx} className="rpg-skeleton" style={{ height: '200px', borderRadius: '12px' }} />
            ))}
          </div>
        )}

        {!isLoadingInventory && inventory.length === 0 && (
          <div
            className="rpg-card"
            style={{
              padding: '3.5rem 1.5rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-surface-sunken)',
              border: '1px dashed var(--border-subtle)',
              borderRadius: '16px',
            }}
          >
            <ShoppingBag size={48} color="var(--text-tertiary)" style={{ margin: '0 auto 1rem', opacity: 0.6 }} />
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Your Inventory is Empty
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
              Complete quests and spend your Gold in the Shop to collect rewards, equip cosmetic themes, and unlock milestone relics.
            </p>
            <Link
              to="/app/shop"
              className="rpg-button primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.4rem', minHeight: '42px' }}
            >
              <Sparkles size={16} />
              <span>Visit Citadel Armory</span>
            </Link>
          </div>
        )}

        {!isLoadingInventory && inventory.length > 0 && filteredItems.length === 0 && (
          <div
            className="rpg-card"
            style={{
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-surface-sunken)',
              border: '1px dashed var(--border-subtle)',
            }}
          >
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              No owned items matching the "{selectedCategory}" category.
            </p>
          </div>
        )}

        {filteredItems.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: '1.25rem' }}>
            {filteredItems.map(item => {
              const targetId = item.itemId || item.shopItemId;
              return (
                <InventoryItemCard
                  key={item.id}
                  item={item}
                  isEquipped={isEquipped(targetId) || Boolean(item.equipped)}
                  isPending={pendingEquipItemIds.has(targetId)}
                  onEquip={handleEquip}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
