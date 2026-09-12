import React, { useState } from 'react';
import { useAuth } from '../../context/useAuth';
import { useShop } from '../../context/useShop';
import type { ShopItem } from '../../types/contract';
import { ShopItemCard } from './ShopItemCard';
import { PurchaseConfirmModal } from './PurchaseConfirmModal';
import { 
  Store, 
  Coins, 
  RotateCw, 
  AlertCircle, 
  CheckCircle2, 
  ShoppingBag
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Items' },
  { id: 'theme', label: 'Themes' },
  { id: 'frame', label: 'Avatar Frames' },
  { id: 'badge', label: 'Badges' },
  { id: 'title', label: 'Titles' },
];

export const ShopPage: React.FC = () => {
  const { character } = useAuth();
  const {
    shopItems,
    isLoadingShop,
    shopError,
    pendingPurchaseItemIds,
    pendingEquipItemIds,
    purchaseItem,
    equipItem,
    isOwned,
    isEquipped,
    loadShop,
  } = useShop();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItemForPurchase, setSelectedItemForPurchase] = useState<ShopItem | null>(null);
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
  const [purchaseModalError, setPurchaseModalError] = useState<string | null>(null);
  const [purchaseSuccessMessage, setPurchaseSuccessMessage] = useState<string | null>(null);

  const gold = character?.gold ?? 0;

  // Filter items by category tab
  const filteredItems = shopItems.filter(item => {
    if (selectedCategory === 'all') return true;
    return item.itemType.toLowerCase() === selectedCategory.toLowerCase();
  });

  const handleInitiatePurchase = (item: ShopItem) => {
    setPurchaseModalError(null);
    setSelectedItemForPurchase(item);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedItemForPurchase) return;

    setIsPurchasing(true);
    setPurchaseModalError(null);

    try {
      await purchaseItem(selectedItemForPurchase.id);
      setPurchaseSuccessMessage(`Acquired ${selectedItemForPurchase.name}! Item is now available in your Inventory.`);
      setSelectedItemForPurchase(null);

      // Auto dismiss success toast after 5s
      setTimeout(() => {
        setPurchaseSuccessMessage(null);
      }, 5000);
    } catch (err: any) {
      if (err.code === 'INSUFFICIENT_GOLD' || err.message?.includes('409') || err.message?.includes('Gold')) {
        setPurchaseModalError('Insufficient Gold in Citadel Treasury to acquire this item.');
      } else if (err.code === 'ITEM_ALREADY_OWNED') {
        setPurchaseModalError('This item is already owned in your inventory.');
      } else {
        setPurchaseModalError(err.message || 'Citadel purchase transaction failed.');
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleEquip = async (item: ShopItem) => {
    try {
      await equipItem(item.id);
      setPurchaseSuccessMessage(`Equipped ${item.name}! Cosmetic active across Citadel.`);
      setTimeout(() => {
        setPurchaseSuccessMessage(null);
      }, 4000);
    } catch (err: any) {
      setPurchaseSuccessMessage(null);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Header Banner with Gold Counter */}
      <header
        className="rpg-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          flexWrap: 'wrap',
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-elevated) 100%)',
          border: '1px solid var(--border-strong)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '2px solid rgba(245, 158, 11, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.2)',
            }}
          >
            <Store size={28} color="var(--color-gold)" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              The Citadel Armory
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.2rem 0 0' }}>
              Acquire cosmetic themes, avatar frames, and milestone relics verified by the backend.
            </p>
          </div>
        </div>

        {/* Authoritative Gold Balance & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.6rem 1.25rem',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-surface-sunken)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              boxShadow: '0 0 15px rgba(245, 158, 11, 0.1)',
            }}
          >
            <Coins size={22} color="var(--color-gold)" />
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
                Treasury Balance
              </div>
              <div className="mono-numbers" style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--color-gold)', lineHeight: 1 }}>
                {gold.toLocaleString()} <span style={{ fontSize: '0.85rem' }}>Gold</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => void loadShop()}
            disabled={isLoadingShop}
            className="rpg-button secondary"
            style={{ padding: '0.65rem 0.9rem' }}
            aria-label="Refresh shop catalog"
          >
            <RotateCw size={16} className={isLoadingShop ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Success Notification Banner */}
      {purchaseSuccessMessage && (
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
          <span>{purchaseSuccessMessage}</span>
        </div>
      )}

      {/* Recoverable Error State */}
      {shopError && (
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
                Armory Catalog Notice
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {shopError}. Displaying canonical items.
              </div>
            </div>
          </div>
          <button
            onClick={() => void loadShop()}
            className="rpg-button secondary"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* 2. Category Filter Tabs */}
      <nav aria-label="Shop Categories" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
              }}
              aria-pressed={isSelected}
            >
              {cat.label}
            </button>
          );
        })}
      </nav>

      {/* 3. Items Grid */}
      <section aria-label="Shop Catalog">
        {isLoadingShop && shopItems.length === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {[1, 2, 3, 4, 5, 6].map(idx => (
              <div key={idx} className="rpg-skeleton" style={{ height: '220px', borderRadius: '12px' }} />
            ))}
          </div>
        )}

        {!isLoadingShop && filteredItems.length === 0 && (
          <div
            className="rpg-card"
            style={{
              padding: '3rem 1.5rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-surface-sunken)',
              border: '1px dashed var(--border-subtle)',
            }}
          >
            <ShoppingBag size={40} color="var(--text-tertiary)" style={{ margin: '0 auto 0.75rem', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              No Items in this Category
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
              Check back soon as new seasonal cosmetics and milestone relics enter the Citadel catalog.
            </p>
          </div>
        )}

        {filteredItems.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {filteredItems.map(item => (
              <ShopItemCard
                key={item.id}
                item={item}
                isOwned={isOwned(item.id)}
                isEquipped={isEquipped(item.id)}
                isPending={pendingPurchaseItemIds.has(item.id) || pendingEquipItemIds.has(item.id)}
                onInitiatePurchase={handleInitiatePurchase}
                onEquip={handleEquip}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. Purchase Confirmation Modal */}
      <PurchaseConfirmModal
        item={selectedItemForPurchase}
        isOpen={Boolean(selectedItemForPurchase)}
        isProcessing={isPurchasing}
        error={purchaseModalError}
        onConfirm={handleConfirmPurchase}
        onClose={() => setSelectedItemForPurchase(null)}
      />
    </div>
  );
};
