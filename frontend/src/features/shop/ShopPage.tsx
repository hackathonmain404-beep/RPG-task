import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/useAuth';
import { useShop } from '../../context/useShop';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';
import type { ShopItem } from '../../types/contract';
import { ArmoryHero } from './components/ArmoryHero';
import { TreasuryPanel } from './components/TreasuryPanel';
import { CategoryNavigation } from './components/CategoryNavigation';
import { ShopToolbar, type SortOption } from './components/ShopToolbar';
import { ShopItemCard } from './ShopItemCard';
import { PurchaseConfirmModal } from './PurchaseConfirmModal';
import { ItemDetailsModal } from './components/ItemDetailsModal';
import { ShopLoadingState } from './components/ShopLoadingState';
import { ShopEmptyState } from './components/ShopEmptyState';
import { ShopErrorState } from './components/ShopErrorState';
import { CheckCircle2 } from 'lucide-react';
import './shop-armory.css';

const RARITY_WEIGHTS: Record<string, number> = {
  legendary: 5,
  epic: 4,
  rare: 3,
  uncommon: 2,
  common: 1,
};

export const ShopPage: React.FC = () => {
  useDocumentMetadata('The Citadel Armory', { noindex: true });

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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('default');

  const [selectedItemForPurchase, setSelectedItemForPurchase] = useState<ShopItem | null>(null);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<ShopItem | null>(null);
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
  const [purchaseModalError, setPurchaseModalError] = useState<string | null>(null);
  const [purchaseSuccessMessage, setPurchaseSuccessMessage] = useState<string | null>(null);
  const [justAcquiredItemId, setJustAcquiredItemId] = useState<string | null>(null);

  const gold = character?.gold ?? 0;

  // Filter and Sort Items
  const processedItems = useMemo(() => {
    let result = [...shopItems];

    // 1. Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(item => {
        const itemTypeLower = (item.itemType || '').toLowerCase();
        const itemCatLower = (item.category || '').toLowerCase();
        const itemIdLower = (item.id || '').toLowerCase();
        if (selectedCategory === 'frame') {
          return itemTypeLower === 'frame' || itemTypeLower === 'cosmetic' || itemCatLower === 'frame' || itemIdLower.startsWith('frame_');
        }
        return itemTypeLower === selectedCategory.toLowerCase() || itemCatLower === selectedCategory.toLowerCase();
      });
    }

    // 2. Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        item =>
          (item.name || '').toLowerCase().includes(q) ||
          (item.description || '').toLowerCase().includes(q)
      );
    }

    // 3. Sort items
    if (sortBy === 'price-asc') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'rarity') {
      result.sort((a, b) => {
        const weightA = RARITY_WEIGHTS[a.rarity?.toLowerCase() || 'common'] || 0;
        const weightB = RARITY_WEIGHTS[b.rarity?.toLowerCase() || 'common'] || 0;
        return weightB - weightA;
      });
    } else if (sortBy === 'name') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return result;
  }, [shopItems, selectedCategory, searchQuery, sortBy]);

  const handleInitiatePurchase = (item: ShopItem) => {
    setPurchaseModalError(null);
    setSelectedItemForPurchase(item);
  };

  const handleInspect = (item: ShopItem) => {
    setSelectedItemForDetails(item);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedItemForPurchase) return;

    setIsPurchasing(true);
    setPurchaseModalError(null);

    try {
      await purchaseItem(selectedItemForPurchase.id);
      const acquiredId = selectedItemForPurchase.id;

      setJustAcquiredItemId(acquiredId);
      setPurchaseSuccessMessage(`Acquired ${selectedItemForPurchase.name}! Item is now available in your Inventory.`);
      setSelectedItemForPurchase(null);

      // Dismiss pulse animation after 1000ms
      setTimeout(() => {
        setJustAcquiredItemId(null);
      }, 1000);

      // Auto dismiss success toast after 5s
      setTimeout(() => {
        setPurchaseSuccessMessage(null);
      }, 5000);
    } catch (err: any) {
      if (err.code === 'INSUFFICIENT_GOLD' || err.message?.includes('409') || err.message?.includes('Gold')) {
        setPurchaseModalError('Insufficient Gold in Citadel Treasury to acquire this item.');
      } else if (err.code === 'ITEM_ALREADY_OWNED' || err.message?.includes('already own')) {
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
    } catch {
      setPurchaseSuccessMessage(null);
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('default');
  };

  return (
    <div className="armory-container">
      {/* Subtle Ambient Atmosphere */}
      <div className="armory-ambient-backdrop" aria-hidden="true" />
      <div className="armory-grid-texture" aria-hidden="true" />

      {/* 1. Armory Header Banner with Treasury Pod */}
      <header className="armory-hero-banner anim-entrance-1">
        <ArmoryHero itemCount={shopItems.length} />
        <TreasuryPanel
          gold={gold}
          isLoading={isLoadingShop}
          onRefresh={loadShop}
        />
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
            padding: '0.95rem 1.35rem',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.45)',
            color: '#a7f3d0',
            fontWeight: 600,
            borderRadius: '12px',
            animation: 'dashboardFadeSlideIn 0.3s ease-out',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)',
          }}
        >
          <CheckCircle2 size={20} color="var(--status-success, #10b981)" />
          <span>{purchaseSuccessMessage}</span>
        </div>
      )}

      {/* Recoverable Error State */}
      {shopError && (
        <ShopErrorState
          error={shopError}
          onRetry={loadShop}
        />
      )}

      {/* 2. Category Filter Tabs & Toolbar Controls */}
      <div className="armory-controls-bar anim-entrance-2">
        <CategoryNavigation
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          shopItems={shopItems}
        />

        <ShopToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </div>

      {/* 3. Items Grid / Loading / Empty State */}
      <section aria-label="Shop Catalog" className="anim-entrance-3">
        {isLoadingShop && shopItems.length === 0 && (
          <ShopLoadingState />
        )}

        {!isLoadingShop && processedItems.length === 0 && (
          <ShopEmptyState
            isFiltered={selectedCategory !== 'all' || Boolean(searchQuery)}
            onResetFilters={handleResetFilters}
          />
        )}

        {processedItems.length > 0 && (
          <div className="armory-grid">
            {processedItems.map((item, index) => (
              <ShopItemCard
                key={item.id}
                item={item}
                index={index}
                isOwned={isOwned(item.id)}
                isEquipped={isEquipped(item.id)}
                isPending={pendingPurchaseItemIds.has(item.id) || pendingEquipItemIds.has(item.id)}
                playerGold={gold}
                isJustAcquired={justAcquiredItemId === item.id}
                onInitiatePurchase={handleInitiatePurchase}
                onEquip={handleEquip}
                onInspect={handleInspect}
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

      {/* 5. Item Inspection Details Modal */}
      <ItemDetailsModal
        item={selectedItemForDetails}
        isOpen={Boolean(selectedItemForDetails)}
        isOwned={Boolean(selectedItemForDetails && isOwned(selectedItemForDetails.id))}
        isEquipped={Boolean(selectedItemForDetails && isEquipped(selectedItemForDetails.id))}
        isPending={Boolean(selectedItemForDetails && (pendingPurchaseItemIds.has(selectedItemForDetails.id) || pendingEquipItemIds.has(selectedItemForDetails.id)))}
        playerGold={gold}
        onClose={() => setSelectedItemForDetails(null)}
        onInitiatePurchase={handleInitiatePurchase}
        onEquip={handleEquip}
      />
    </div>
  );
};
