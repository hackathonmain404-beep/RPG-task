import React, { useState, useEffect, useCallback } from 'react';
import { 
  getMarketItems, 
  createMarketItem, 
  updateMarketItem, 
  deleteMarketItem 
} from '../../services/api/admin';
import type { MarketItem } from '../../types/contract';
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Coins, 
  Sparkles, 
  Loader2, 
  X, 
  Edit3, 
  Eye, 
  EyeOff,
  PackageCheck
} from 'lucide-react';
import { WindowPopModal } from '../../components/common/WindowPopModal';

export const MarketStudioTab: React.FC = () => {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  // New Item Form State
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<number>(150);
  const [category, setCategory] = useState<string>('Weapon');
  const [rarity, setRarity] = useState<string>('rare');
  const [imageUrl, setImageUrl] = useState<string>('swords');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Edit Item State
  const [editingItem, setEditingItem] = useState<MarketItem | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Pop Modal State (replaces native window.confirm & alert)
  const [deleteTargetItem, setDeleteTargetItem] = useState<{ id: string; name: string } | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState<boolean>(false);
  const [popAlert, setPopAlert] = useState<{ title: string; message: string; type?: 'danger' | 'warning' | 'info' | 'success' } | null>(null);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setErrorText(null);
    try {
      const res = await getMarketItems();
      setItems(res.items);
    } catch (err: any) {
      setErrorText(err?.message || 'Failed to load shop items from database.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    setIsCreating(true);
    setErrorText(null);

    try {
      const res = await createMarketItem({
        name: name.trim(),
        description: description.trim(),
        price: Number(price) || 50,
        category,
        rarity,
        imageUrl: imageUrl.trim() || 'swords',
        displayOrder: Number(displayOrder) || 1,
        active: true,
      });

      setItems(prev => [res.item, ...prev]);
      setShowAddForm(false);
      setName('');
      setDescription('');
      setPrice(150);
    } catch (err: any) {
      setErrorText(err?.message || 'Failed to create shop item.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleActive = async (item: MarketItem) => {
    try {
      const updated = await updateMarketItem(item.id, { active: !item.active });
      setItems(prev => prev.map(i => (i.id === item.id ? updated.item : i)));
    } catch (err: any) {
      setPopAlert({
        title: 'Status Update Failed',
        message: err?.message || 'Failed to toggle item active status.',
        type: 'danger',
      });
    }
  };

  const handleOpenEditModal = (item: MarketItem) => {
    setEditingItem(item);
    setEditPrice(item.price);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsUpdating(true);
    try {
      const res = await updateMarketItem(editingItem.id, { price: Number(editPrice) || editingItem.price });
      setItems(prev => prev.map(i => (i.id === editingItem.id ? res.item : i)));
      setEditingItem(null);
    } catch (err: any) {
      setPopAlert({
        title: 'Price Update Failed',
        message: err?.message || 'Failed to update item price.',
        type: 'danger',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteItem = (item: MarketItem) => {
    setDeleteTargetItem({ id: item.id, name: item.name });
  };

  const confirmDeleteItem = async () => {
    if (!deleteTargetItem) return;

    setIsDeletingItem(true);
    try {
      await deleteMarketItem(deleteTargetItem.id);
      setItems(prev => prev.filter(i => i.id !== deleteTargetItem.id));
      setDeleteTargetItem(null);
    } catch (err: any) {
      setPopAlert({
        title: 'Delete Failed',
        message: err?.message || 'Failed to delete market item.',
        type: 'danger',
      });
    } finally {
      setIsDeletingItem(false);
    }
  };

  const getRarityColor = (r: string) => {
    switch (r.toLowerCase()) {
      case 'legendary': return '#f59e0b';
      case 'epic': return '#a855f7';
      case 'rare': return '#38bdf8';
      case 'uncommon': return '#10b981';
      case 'common':
      default: return '#94a3b8';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '1.25rem 1.5rem',
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={22} color="#38bdf8" />
            <span>Market Studio — Dynamic Shop Catalog</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Authoritatively create and publish in-game items to the database that players purchase with earned gold.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(prev => !prev)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.65rem 1.1rem',
            borderRadius: '8px',
            background: showAddForm
              ? 'rgba(255, 255, 255, 0.1)'
              : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            border: 'none',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
          }}
        >
          {showAddForm ? <X size={16} /> : <Plus size={16} />}
          <span>{showAddForm ? 'Cancel' : 'Create New Item'}</span>
        </button>
      </div>

      {errorText && (
        <div
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            fontSize: '0.85rem',
          }}
        >
          {errorText}
        </div>
      )}

      {/* CREATE ITEM ACCORDION FORM */}
      {showAddForm && (
        <form
          onSubmit={handleCreateItem}
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontWeight: 700, fontSize: '0.95rem' }}>
            <Sparkles size={16} />
            <span>Forge New Database Market Item</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.3rem' }}>
                Item Name
              </label>
              <input
                type="text"
                placeholder="e.g. Phoenix Blade"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#f8fafc',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.3rem' }}>
                Price (Gold Coins)
              </label>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fbbf24',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.3rem' }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#f8fafc',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                }}
              >
                <option value="Weapon">Weapon</option>
                <option value="Armor">Armor</option>
                <option value="Consumable">Consumable</option>
                <option value="Cosmetic">Cosmetic</option>
                <option value="Title">Title</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.3rem' }}>
                Rarity
              </label>
              <select
                value={rarity}
                onChange={(e) => setRarity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: getRarityColor(rarity),
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                }}
              >
                <option value="common">Common</option>
                <option value="uncommon">Uncommon</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.3rem' }}>
                Icon / Asset Key
              </label>
              <input
                type="text"
                placeholder="e.g. swords, shield, scroll, potion"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#f8fafc',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.3rem' }}>
                Display Order
              </label>
              <input
                type="number"
                min={1}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#f8fafc',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.3rem' }}>
              Item Description & Lore
            </label>
            <textarea
              rows={2}
              placeholder="Forged in the heart of a fallen star. Imbues the wielder with unyielding focus."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#f8fafc',
                fontSize: '0.88rem',
                boxSizing: 'border-box',
                resize: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              style={{
                padding: '0.65rem 1.5rem',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: isCreating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
            >
              {isCreating ? <Loader2 size={16} className="animate-spin" /> : <PackageCheck size={16} />}
              <span>Save & Publish to Shop</span>
            </button>
          </div>
        </form>
      )}

      {/* ITEMS CATALOG GRID */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3.5rem', color: '#38bdf8' }}>
          <Loader2 size={32} className="animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3.5rem',
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: '12px',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
            color: '#94a3b8',
          }}
        >
          No shop items found in database catalog. Click &quot;Create New Item&quot; to seed your marketplace.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'rgba(15, 23, 42, 0.65)',
                border: item.active ? `1px solid ${getRarityColor(item.rarity)}44` : '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                opacity: item.active ? 1 : 0.6,
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                    {item.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: getRarityColor(item.rarity),
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {item.rarity}
                    </span>
                    <span style={{ color: '#64748b' }}>•</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {item.category || item.itemType}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'rgba(251, 191, 36, 0.12)',
                    border: '1px solid rgba(251, 191, 36, 0.35)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '9999px',
                    color: '#fbbf24',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  <Coins size={14} />
                  <span>{item.price}</span>
                </div>
              </div>

              <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.45, margin: 0 }}>
                {item.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <button
                  type="button"
                  onClick={() => handleToggleActive(item)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'none',
                    border: 'none',
                    color: item.active ? '#10b981' : '#64748b',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {item.active ? <Eye size={14} /> : <EyeOff size={14} />}
                  <span>{item.active ? 'Active in Shop' : 'Deactivated'}</span>
                </button>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(item)}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#cbd5e1',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <Edit3 size={13} />
                    <span>Price</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item)}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '6px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#fca5a5',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT PRICE MODAL */}
      {editingItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setEditingItem(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              backgroundColor: '#0f172a',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '16px',
              padding: '1.5rem',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>
              Edit Price: {editingItem.name}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '1rem' }}>
              Update gold coin requirement for this dynamic item.
            </p>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.3rem' }}>
                  Gold Coins
                </label>
                <input
                  type="number"
                  min={0}
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fbbf24',
                    fontWeight: 700,
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#94a3b8',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isUpdating ? 'Saving...' : 'Save Price'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Window Pop Modal for Market Item Deletion Confirmation */}
      <WindowPopModal
        isOpen={Boolean(deleteTargetItem)}
        onClose={() => setDeleteTargetItem(null)}
        onConfirm={confirmDeleteItem}
        isLoading={isDeletingItem}
        title="Delete Market Item?"
        message={
          deleteTargetItem ? (
            <span>
              Are you sure you want to delete <strong style={{ color: '#f8fafc' }}>{deleteTargetItem.name}</strong> from the Citadel market catalog?
            </span>
          ) : ''
        }
        type="danger"
        confirmText="Delete Item"
        cancelText="Cancel"
      />

      {/* Window Pop Modal for Errors & Notifications */}
      {popAlert && (
        <WindowPopModal
          isOpen={Boolean(popAlert)}
          onClose={() => setPopAlert(null)}
          title={popAlert.title}
          message={popAlert.message}
          type={popAlert.type || 'info'}
        />
      )}
    </div>
  );
};
