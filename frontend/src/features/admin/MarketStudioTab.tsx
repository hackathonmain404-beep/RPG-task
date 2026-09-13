import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  PackageCheck,
  Search,
  Check,
  CheckSquare,
  Square,
  MoreVertical,
  Copy,
  Shield,
  Star,
  Zap,
  RotateCcw,
  Flame,
  Sword,
  Layers,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Info,
  SlidersHorizontal
} from 'lucide-react';
import { WindowPopModal } from '../../components/common/WindowPopModal';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export const MarketStudioTab: React.FC = () => {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRarity, setSelectedRarity] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'RARITY' | 'NAME'>('NEWEST');
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'All') count++;
    if (selectedRarity !== 'All') count++;
    if (selectedStatus !== 'ALL') count++;
    if (sortBy !== 'NEWEST') count++;
    if (featuredOnly) count++;
    return count;
  }, [selectedCategory, selectedRarity, selectedStatus, sortBy, featuredOnly]);

  // Featured state (stored in localStorage for persistence across sessions)
  const [featuredIds, setFeaturedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('achiever_market_featured_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  // Multi-selection state for bulk management
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // "..." More menu state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Slide-over detail drawer state
  const [inspectedItem, setInspectedItem] = useState<MarketItem | null>(null);

  // New Item Form / Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [formName, setFormName] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formPrice, setFormPrice] = useState<number>(150);
  const [formCategory, setFormCategory] = useState<string>('Weapon');
  const [formRarity, setFormRarity] = useState<string>('rare');
  const [formImageUrl, setFormImageUrl] = useState<string>('swords');
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(1);
  const [formActive, setFormActive] = useState<boolean>(true);
  const [formFeatured, setFormFeatured] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Edit Price Modal State
  const [editingPriceItem, setEditingPriceItem] = useState<MarketItem | null>(null);
  const [editPriceVal, setEditPriceVal] = useState<number>(0);
  const [isUpdatingPrice, setIsUpdatingPrice] = useState<boolean>(false);
  const [priceError, setPriceError] = useState<string | null>(null);

  // Delete Item Confirmation Modal
  const [deleteTargetItem, setDeleteTargetItem] = useState<{ id: string; name: string } | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState<boolean>(false);

  // Pop Alert Modal
  const [popAlert, setPopAlert] = useState<{ title: string; message: string; type?: 'danger' | 'warning' | 'info' | 'success' } | null>(null);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const saveFeaturedIds = (newSet: Set<string>) => {
    setFeaturedIds(newSet);
    try {
      localStorage.setItem('achiever_market_featured_ids', JSON.stringify(Array.from(newSet)));
    } catch (e) {
      console.error('Failed to save featured item ids to localStorage', e);
    }
  };

  const toggleFeaturedItem = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const next = new Set(featuredIds);
    if (next.has(id)) {
      next.delete(id);
      addToast('Removed from Featured items', 'info');
    } else {
      next.add(id);
      addToast('Marked as Featured item in Shop!', 'success');
    }
    saveFeaturedIds(next);
  };

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

  // Global click dismiss for action menus
  useEffect(() => {
    const handleDocumentClick = () => {
      if (activeMenuId) setActiveMenuId(null);
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [activeMenuId]);

  // Global Escape key dismiss for drawers and modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeMenuId) setActiveMenuId(null);
        else if (editingPriceItem) setEditingPriceItem(null);
        else if (inspectedItem) setInspectedItem(null);
        else if (showCreateModal) setShowCreateModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMenuId, editingPriceItem, inspectedItem, showCreateModal]);

  // Rarity color helper
  const getRarityColor = (r: string) => {
    switch (r?.toLowerCase()) {
      case 'legendary': return '#f59e0b';
      case 'epic': return '#a855f7';
      case 'rare': return '#38bdf8';
      case 'uncommon': return '#10b981';
      case 'common':
      default: return '#94a3b8';
    }
  };

  // Asset icon helper based on item category or imageUrl
  const getAssetIcon = (category: string | undefined | null, imageUrl: string | undefined | null, rarity: string) => {
    const cat = (category || '').toLowerCase();
    const key = (imageUrl || '').toLowerCase();
    const color = getRarityColor(rarity);

    if (key.includes('sword') || cat.includes('weapon')) return <Sword size={24} color={color} />;
    if (key.includes('shield') || cat.includes('armor')) return <Shield size={24} color={color} />;
    if (key.includes('theme') || cat.includes('theme')) return <Layers size={24} color={color} />;
    if (key.includes('fire') || key.includes('flame') || cat.includes('effect')) return <Flame size={24} color={color} />;
    if (key.includes('star') || cat.includes('title')) return <Star size={24} color={color} />;
    if (key.includes('zap') || key.includes('potion') || cat.includes('consumable')) return <Zap size={24} color={color} />;
    return <Sparkles size={24} color={color} />;
  };

  // Micro-animation theme class
  const getThemeAnimClass = (item: MarketItem) => {
    const combined = `${item.name} ${item.description} ${item.category || ''} ${item.rarity}`.toLowerCase();
    if (combined.includes('cyber') || combined.includes('neon')) return 'cmd-theme-cyberpunk';
    if (combined.includes('matrix') || combined.includes('digital') || combined.includes('terminal')) return 'cmd-theme-matrix';
    if (combined.includes('lofi') || combined.includes('chill') || combined.includes('zen')) return 'cmd-theme-lofi';
    return '';
  };

  // Summary KPI Metrics
  const stats = useMemo(() => {
    const totalItems = items.length;
    const activeItems = items.filter(i => i.active).length;
    const featuredItems = items.filter(i => featuredIds.has(i.id)).length;
    const totalPrice = items.reduce((sum, i) => sum + (Number(i.price) || 0), 0);
    const avgPrice = totalItems > 0 ? Math.round(totalPrice / totalItems) : 0;

    return {
      totalItems,
      activeItems,
      featuredItems,
      avgPrice,
      totalShopValue: totalPrice,
    };
  }, [items, featuredIds]);

  // Derived Categories with counts
  const categoriesWithCounts = useMemo(() => {
    const map = new Map<string, number>();
    map.set('All', items.length);

    items.forEach(item => {
      const cat = item.category || item.itemType || 'Uncategorized';
      map.set(cat, (map.get(cat) || 0) + 1);
    });

    // Ensure standard cosmetic categories are available if admin wants to filter
    const defaults = ['Weapon', 'Armor', 'Consumable', 'Cosmetic', 'Title', 'Themes', 'Avatars', 'Badges'];
    defaults.forEach(d => {
      if (!map.has(d)) map.set(d, 0);
    });

    return Array.from(map.entries())
      .filter(([cat, count]) => count > 0 || cat === 'All' || defaults.includes(cat))
      .sort((a, b) => {
        if (a[0] === 'All') return -1;
        if (b[0] === 'All') return 1;
        return b[1] - a[1];
      });
  }, [items]);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesCat = (item.category || item.itemType || '').toLowerCase().includes(q);
        const matchesImg = (item.imageUrl || '').toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat && !matchesImg) return false;
      }

      // Category match
      if (selectedCategory !== 'All') {
        const cat = item.category || item.itemType || 'Uncategorized';
        if (cat.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      }

      // Rarity match
      if (selectedRarity !== 'All') {
        if (item.rarity.toLowerCase() !== selectedRarity.toLowerCase()) return false;
      }

      // Status match
      if (selectedStatus === 'ACTIVE' && !item.active) return false;
      if (selectedStatus === 'INACTIVE' && item.active) return false;

      // Featured match
      if (featuredOnly && !featuredIds.has(item.id)) return false;

      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'PRICE_ASC':
          return a.price - b.price;
        case 'PRICE_DESC':
          return b.price - a.price;
        case 'NAME':
          return a.name.localeCompare(b.name);
        case 'RARITY': {
          const rarityOrder: Record<string, number> = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
          return (rarityOrder[b.rarity.toLowerCase()] || 0) - (rarityOrder[a.rarity.toLowerCase()] || 0);
        }
        case 'OLDEST':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'NEWEST':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [items, searchQuery, selectedCategory, selectedRarity, selectedStatus, featuredOnly, featuredIds, sortBy]);

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'All' || selectedRarity !== 'All' || selectedStatus !== 'ALL' || featuredOnly;

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedRarity('All');
    setSelectedStatus('ALL');
    setFeaturedOnly(false);
    setSortBy('NEWEST');
    addToast('Filters reset to default view', 'info');
  };

  // Multi-selection handlers
  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    if (selectedIds.size === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map(i => i.id)));
    }
  };

  // Bulk Actions
  const handleBulkActivate = async (active: boolean) => {
    const idsToUpdate = Array.from(selectedIds);
    if (idsToUpdate.length === 0) return;

    try {
      const updatedList = await Promise.all(
        idsToUpdate.map(id => updateMarketItem(id, { active }))
      );
      const updatedMap = new Map(updatedList.map(u => [u.item.id, u.item]));
      setItems(prev => prev.map(item => updatedMap.get(item.id) || item));
      setSelectedIds(new Set());
      addToast(`Updated ${idsToUpdate.length} items to ${active ? 'Active' : 'Deactivated'}`, 'success');
    } catch (err: any) {
      setPopAlert({
        title: 'Bulk Update Failed',
        message: err?.message || 'Failed to update selected items.',
        type: 'danger',
      });
    }
  };

  const handleBulkFeatured = (featured: boolean) => {
    const next = new Set(featuredIds);
    selectedIds.forEach(id => {
      if (featured) next.add(id);
      else next.delete(id);
    });
    saveFeaturedIds(next);
    setSelectedIds(new Set());
    addToast(`Updated Featured status for ${selectedIds.size} items`, 'success');
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setDeleteTargetItem({
      id: Array.from(selectedIds).join(','),
      name: `${selectedIds.size} selected items`,
    });
  };

  // Create Item Handler
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDescription.trim()) return;

    setIsCreating(true);
    setErrorText(null);

    try {
      const res = await createMarketItem({
        name: formName.trim(),
        description: formDescription.trim(),
        price: Number(formPrice) || 50,
        category: formCategory,
        rarity: formRarity,
        imageUrl: formImageUrl.trim() || 'swords',
        displayOrder: Number(formDisplayOrder) || 1,
        active: formActive,
      });

      if (formFeatured) {
        const next = new Set(featuredIds);
        next.add(res.item.id);
        saveFeaturedIds(next);
      }

      setItems(prev => [res.item, ...prev]);
      setShowCreateModal(false);
      setFormName('');
      setFormDescription('');
      setFormPrice(150);
      setFormImageUrl('swords');
      setFormFeatured(false);
      addToast(`Published "${res.item.name}" into Citadel Market!`, 'success');
    } catch (err: any) {
      setErrorText(err?.message || 'Failed to create shop item.');
      addToast('Failed to create shop item', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  // Toggle Single Active Status
  const handleToggleActive = async (item: MarketItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const updated = await updateMarketItem(item.id, { active: !item.active });
      setItems(prev => prev.map(i => (i.id === item.id ? updated.item : i)));
      if (inspectedItem && inspectedItem.id === item.id) {
        setInspectedItem(updated.item);
      }
      addToast(`"${item.name}" is now ${!item.active ? 'Active' : 'Deactivated'} in shop`, 'info');
    } catch (err: any) {
      setPopAlert({
        title: 'Status Update Failed',
        message: err?.message || 'Failed to toggle item active status.',
        type: 'danger',
      });
    }
  };

  // Edit Price Handlers
  const handleOpenEditPrice = (item: MarketItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPriceItem(item);
    setEditPriceVal(item.price);
    setPriceError(null);
    setActiveMenuId(null);
  };

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPriceItem) return;

    if (isNaN(editPriceVal) || editPriceVal < 0) {
      setPriceError('Price must be a valid number of 0 or greater.');
      return;
    }

    setIsUpdatingPrice(true);
    setPriceError(null);
    try {
      const res = await updateMarketItem(editingPriceItem.id, { price: Number(editPriceVal) });
      setItems(prev => prev.map(i => (i.id === editingPriceItem.id ? res.item : i)));
      if (inspectedItem && inspectedItem.id === editingPriceItem.id) {
        setInspectedItem(res.item);
      }
      addToast(`Price for "${editingPriceItem.name}" updated to ${editPriceVal} Gold`, 'success');
      setEditingPriceItem(null);
    } catch (err: any) {
      setPriceError(err?.message || 'Failed to update item price.');
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  // Duplicate Item into Form
  const handleDuplicateItem = (item: MarketItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFormName(`${item.name} (Copy)`);
    setFormDescription(item.description);
    setFormPrice(item.price);
    setFormCategory(item.category || item.itemType || 'Weapon');
    setFormRarity(item.rarity || 'rare');
    setFormImageUrl(item.imageUrl || 'swords');
    setFormDisplayOrder((item.displayOrder || 1) + 1);
    setFormActive(true);
    setFormFeatured(false);
    setShowCreateModal(true);
    setActiveMenuId(null);
    addToast(`Duplicated "${item.name}" into item creator`, 'info');
  };

  // Delete Handlers
  const handleDeleteItem = (item: MarketItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteTargetItem({ id: item.id, name: item.name });
    setActiveMenuId(null);
  };

  const confirmDeleteItem = async () => {
    if (!deleteTargetItem) return;

    setIsDeletingItem(true);
    try {
      if (deleteTargetItem.id.includes(',')) {
        // Bulk delete
        const ids = deleteTargetItem.id.split(',');
        await Promise.all(ids.map(id => deleteMarketItem(id)));
        setItems(prev => prev.filter(i => !ids.includes(i.id)));
        setSelectedIds(new Set());
        addToast(`Deleted ${ids.length} items from database`, 'success');
      } else {
        // Single delete
        await deleteMarketItem(deleteTargetItem.id);
        setItems(prev => prev.filter(i => i.id !== deleteTargetItem.id));
        if (inspectedItem && inspectedItem.id === deleteTargetItem.id) {
          setInspectedItem(null);
        }
        addToast(`Deleted "${deleteTargetItem.name}"`, 'success');
      }
      setDeleteTargetItem(null);
    } catch (err: any) {
      setPopAlert({
        title: 'Delete Failed',
        message: err?.message || 'Failed to delete market item from database.',
        type: 'danger',
      });
    } finally {
      setIsDeletingItem(false);
    }
  };

  const copyToClipboard = (text: string, label: string = 'Copied') => {
    navigator.clipboard.writeText(text);
    addToast(`${label} copied to clipboard!`, 'info');
  };

  return (
    <div className="cmd-center-container">
      {/* 1. TOP STUDIO HERO HEADER */}
      <div className="cmd-hero-panel">
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.65rem', margin: 0 }}>
            <ShoppingBag size={24} color="#38bdf8" />
            <span>Market Studio — Dynamic Shop Catalog</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '0.35rem', marginBottom: 0 }}>
            Authoritatively create, price, and curate collectible themes and game cosmetics published to the Citadel player armory.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.35rem',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            border: 'none',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(2, 132, 199, 0.4)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(56, 189, 248, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(2, 132, 199, 0.4)';
          }}
        >
          <Plus size={18} />
          <span>+ Create New Item</span>
        </button>
      </div>

      {/* 2. SUMMARY STATISTICS KPI DECK */}
      <div className="cmd-market-kpi-deck">
        <div className="cmd-market-kpi-card">
          <div className="cmd-market-kpi-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            <ShoppingBag size={20} color="#38bdf8" />
          </div>
          <div className="cmd-market-kpi-info">
            <span className="cmd-market-kpi-label">Total Items</span>
            <span className="cmd-market-kpi-val">{stats.totalItems}</span>
          </div>
        </div>

        <div className="cmd-market-kpi-card">
          <div className="cmd-market-kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <Eye size={20} color="#10b981" />
          </div>
          <div className="cmd-market-kpi-info">
            <span className="cmd-market-kpi-label">Active in Shop</span>
            <span className="cmd-market-kpi-val" style={{ color: '#10b981' }}>
              <span className="cmd-active-pulse-dot" style={{ marginRight: '4px' }} />
              {stats.activeItems}
            </span>
          </div>
        </div>

        <div className="cmd-market-kpi-card">
          <div className="cmd-market-kpi-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
            <Star size={20} color="#c084fc" />
          </div>
          <div className="cmd-market-kpi-info">
            <span className="cmd-market-kpi-label">Featured Items</span>
            <span className="cmd-market-kpi-val" style={{ color: '#c084fc' }}>{stats.featuredItems}</span>
          </div>
        </div>

        <div className="cmd-market-kpi-card">
          <div className="cmd-market-kpi-icon" style={{ background: 'rgba(251, 191, 36, 0.15)', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
            <Coins size={20} color="#fbbf24" />
          </div>
          <div className="cmd-market-kpi-info">
            <span className="cmd-market-kpi-label">Average Price</span>
            <span className="cmd-market-kpi-val" style={{ color: '#fbbf24' }}>{stats.avgPrice} G</span>
          </div>
        </div>

        <div className="cmd-market-kpi-card">
          <div className="cmd-market-kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <DollarSign size={20} color="#f59e0b" />
          </div>
          <div className="cmd-market-kpi-info">
            <span className="cmd-market-kpi-label">Total Shop Value</span>
            <span className="cmd-market-kpi-val" style={{ color: '#f59e0b' }}>{stats.totalShopValue.toLocaleString()} G</span>
          </div>
        </div>
      </div>

      {errorText && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} />
            <span>{errorText}</span>
          </div>
          <button
            type="button"
            onClick={fetchItems}
            style={{
              background: 'none',
              border: 'none',
              color: '#38bdf8',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <RotateCcw size={14} /> Retry
          </button>
        </div>
      )}

      {/* 3. MANAGEMENT TOOLBAR */}
      <div className="cmd-market-toolbar">
        {/* Search & Mobile Filter Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', width: '100%', flex: '1 1 280px' }}>
          <div className="cmd-market-search-box" style={{ flex: 1, minWidth: 160 }}>
            <Search size={16} className="cmd-market-search-icon" />
            <input
              type="text"
              className="cmd-market-search-input"
              placeholder="Search catalog by name, lore, or key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Mobile Filter Trigger Button (< 768px) */}
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="cmd-mobile-filter-trigger"
            aria-label="Open filter settings"
          >
            <SlidersHorizontal size={15} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="cmd-filter-active-count">{activeFilterCount}</span>
            )}
          </button>
        </div>

        {/* Desktop Filters Group (Hidden on mobile via CSS) */}
        <div className="cmd-market-filters-group cmd-desktop-filters-row">
          {/* Rarity */}
          <select
            className="cmd-market-select"
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
          >
            <option value="All">All Rarities</option>
            <option value="common">Common</option>
            <option value="uncommon">Uncommon</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
          </select>

          {/* Status */}
          <select
            className="cmd-market-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active in Shop</option>
            <option value="INACTIVE">Deactivated</option>
          </select>

          {/* Sort */}
          <select
            className="cmd-market-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="NEWEST">Newest First</option>
            <option value="OLDEST">Oldest First</option>
            <option value="PRICE_ASC">Price: Low → High</option>
            <option value="PRICE_DESC">Price: High → Low</option>
            <option value="RARITY">Rarity (Highest)</option>
            <option value="NAME">Name (A → Z)</option>
          </select>

          {/* Featured Toggle */}
          <button
            type="button"
            className={`cmd-market-toggle-btn ${featuredOnly ? 'active' : ''}`}
            onClick={() => setFeaturedOnly(prev => !prev)}
          >
            <Star size={14} />
            <span>Featured Only</span>
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              className="cmd-market-clear-btn"
              onClick={handleClearFilters}
            >
              <RotateCcw size={13} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet (< 768px) */}
      {isMobileFilterOpen && (
        <>
          <div
            className="cmd-filter-sheet-overlay"
            onClick={() => setIsMobileFilterOpen(false)}
            aria-hidden="true"
          />
          <div className="cmd-filter-sheet" role="dialog" aria-label="Market Filters">
            <div className="cmd-sheet-drag-handle" />
            <div className="cmd-filter-sheet-header">
              <div className="cmd-filter-sheet-title">
                <SlidersHorizontal size={18} color="#38bdf8" />
                <span>Market Filters</span>
                {activeFilterCount > 0 && (
                  <span className="cmd-filter-active-count">{activeFilterCount}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.35rem' }}
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            <div className="cmd-filter-sheet-body">
              {/* Category */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.45rem', textTransform: 'uppercase' }}>
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="cmd-market-select"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                >
                  <option value="All">All Categories</option>
                  {categoriesWithCounts.filter(([c]) => c !== 'All').map(([c]) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Rarity */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.45rem', textTransform: 'uppercase' }}>
                  Rarity
                </label>
                <select
                  value={selectedRarity}
                  onChange={(e) => setSelectedRarity(e.target.value)}
                  className="cmd-market-select"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                >
                  <option value="All">All Rarities</option>
                  <option value="common">Common</option>
                  <option value="uncommon">Uncommon</option>
                  <option value="rare">Rare</option>
                  <option value="epic">Epic</option>
                  <option value="legendary">Legendary</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.45rem', textTransform: 'uppercase' }}>
                  Shop Visibility
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="cmd-market-select"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active in Shop</option>
                  <option value="INACTIVE">Deactivated</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.45rem', textTransform: 'uppercase' }}>
                  Sort Order
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="cmd-market-select"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                >
                  <option value="NEWEST">Newest First</option>
                  <option value="OLDEST">Oldest First</option>
                  <option value="PRICE_ASC">Price: Low → High</option>
                  <option value="PRICE_DESC">Price: High → Low</option>
                  <option value="RARITY">Rarity (Highest)</option>
                  <option value="NAME">Name (A → Z)</option>
                </select>
              </div>

              {/* Featured Only Toggle */}
              <div style={{ paddingTop: '0.35rem' }}>
                <button
                  type="button"
                  className={`cmd-market-toggle-btn ${featuredOnly ? 'active' : ''}`}
                  onClick={() => setFeaturedOnly(prev => !prev)}
                  style={{ width: '100%', justifyContent: 'center', height: '44px' }}
                >
                  <Star size={16} fill={featuredOnly ? '#fbbf24' : 'none'} color="#fbbf24" />
                  <span>Featured Items Only</span>
                </button>
              </div>
            </div>

            <div className="cmd-filter-sheet-actions">
              <button
                type="button"
                onClick={handleClearFilters}
                className="cmd-action-btn"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <RotateCcw size={15} />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="cmd-btn-grant"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <Check size={16} />
                <span>Apply Filters</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* 4. CATEGORY / COLLECTION NAVIGATION PILLS */}
      <div className="cmd-collection-nav">
        {categoriesWithCounts.map(([catName, count]) => {
          const isActive = selectedCategory.toLowerCase() === catName.toLowerCase();
          return (
            <button
              key={catName}
              type="button"
              className={`cmd-collection-pill ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedCategory(catName)}
            >
              <span>{catName}</span>
              <span className="cmd-collection-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Select All Bar if items exist */}
      {filteredItems.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.5rem', color: '#94a3b8', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={handleSelectAllFiltered}>
            {selectedIds.size === filteredItems.length && filteredItems.length > 0 ? (
              <CheckSquare size={16} color="#38bdf8" />
            ) : (
              <Square size={16} color="#64748b" />
            )}
            <span>
              {selectedIds.size > 0 
                ? `Selected ${selectedIds.size} of ${filteredItems.length} items` 
                : `Select all (${filteredItems.length} items)`}
            </span>
          </div>
          <span>Showing {filteredItems.length} cosmetics</span>
        </div>
      )}

      {/* 5. ITEM CATALOG GRID / STATES */}
      {isLoading ? (
        <div className="cmd-orbital-loader">
          <div className="cmd-orbit-ring" />
          <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>
            Syncing Citadel Market catalog...
          </span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'rgba(15, 23, 42, 0.5)',
            borderRadius: '16px',
            border: '1px dashed rgba(255, 255, 255, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShoppingBag size={28} color="#38bdf8" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              No Shop Items Found
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.35rem' }}>
              {hasActiveFilters 
                ? 'No items match your active filters. Try clearing filters or searching for another cosmetic.'
                : 'Your Citadel marketplace catalog is currently empty. Seed it by forging a new item.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="cmd-action-btn"
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
              >
                <RotateCcw size={15} /> Reset Filters
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <Plus size={16} /> Create New Item
            </button>
          </div>
        </div>
      ) : (
        <div className="cmd-market-grid">
          {filteredItems.map((item, index) => {
            const isFeatured = featuredIds.has(item.id);
            const isSelected = selectedIds.has(item.id);
            const rarityClass = `rarity-${(item.rarity || 'common').toLowerCase()}`;
            const themeAnimClass = getThemeAnimClass(item);
            const isMenuOpen = activeMenuId === item.id;

            return (
              <div
                key={item.id}
                className={`cmd-market-card ${rarityClass} ${!item.active ? 'is-deactivated' : ''} ${isFeatured ? 'is-featured' : ''}`}
                style={{
                  animation: `cmdCardEntrance 300ms cubic-bezier(0.16, 1, 0.3, 1) ${Math.min(index * 40, 400)}ms forwards`,
                  cursor: 'pointer',
                }}
                onClick={() => setInspectedItem(item)}
              >
                {/* Visual Preview Header */}
                <div className="cmd-market-preview">
                  {/* Glowing background aura */}
                  <div 
                    className="cmd-preview-aura"
                    style={{ background: getRarityColor(item.rarity) }}
                  />

                  {/* Multi-select checkbox */}
                  <div className="cmd-card-checkbox-wrap" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="cmd-card-checkbox"
                      checked={isSelected}
                      onChange={(e) => handleToggleSelect(item.id, e as any)}
                    />
                  </div>

                  {/* Featured Badge */}
                  {isFeatured && (
                    <div className="cmd-card-featured-badge">
                      <Star size={11} fill="#fbbf24" color="#fbbf24" />
                      <span>Featured</span>
                    </div>
                  )}

                  {/* Icon Frame */}
                  <div className={`cmd-market-icon-frame ${themeAnimClass}`}>
                    {getAssetIcon(item.category || item.itemType, item.imageUrl, item.rarity)}
                  </div>
                </div>

                {/* Card Body */}
                <div className="cmd-market-card-body">
                  <div className="cmd-market-card-title">
                    <span>{item.name}</span>
                  </div>

                  <div className="cmd-market-meta-line">
                    <span 
                      className="cmd-rarity-tag"
                      style={{ 
                        color: getRarityColor(item.rarity),
                        backgroundColor: `${getRarityColor(item.rarity)}18`,
                        border: `1px solid ${getRarityColor(item.rarity)}40`,
                      }}
                    >
                      {item.rarity}
                    </span>
                    <span style={{ color: '#475569' }}>•</span>
                    <span className="cmd-category-tag">
                      {item.category || item.itemType || 'Cosmetic'}
                    </span>
                  </div>

                  <p className="cmd-market-desc" title={item.description}>
                    {item.description}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="cmd-market-card-footer" onClick={(e) => e.stopPropagation()}>
                  {/* Price Badge */}
                  <div 
                    className="cmd-price-badge"
                    title="Click to edit price"
                    onClick={(e) => handleOpenEditPrice(item, e)}
                  >
                    <Coins size={15} className="cmd-price-coin" />
                    <span>{item.price} G</span>
                  </div>

                  {/* Right Actions: Status & Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {/* Status Toggle Button */}
                    <button
                      type="button"
                      className={`cmd-market-status-btn ${item.active ? 'cmd-status-active' : 'cmd-status-inactive'}`}
                      title={item.active ? 'Active in Shop (Click to deactivate)' : 'Deactivated (Click to activate)'}
                      onClick={(e) => handleToggleActive(item, e)}
                    >
                      {item.active ? (
                        <>
                          <span className="cmd-active-pulse-dot" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <EyeOff size={13} />
                          <span>Muted</span>
                        </>
                      )}
                    </button>

                    {/* Quick Price Edit Button */}
                    <button
                      type="button"
                      className="cmd-action-btn"
                      title="Quick edit price"
                      onClick={(e) => handleOpenEditPrice(item, e)}
                    >
                      <Edit3 size={13} />
                      <span>Price</span>
                    </button>

                    {/* "..." More Actions Menu */}
                    <div className="cmd-more-menu-wrap">
                      <button
                        type="button"
                        className="cmd-action-btn"
                        title="More actions"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(prev => (prev === item.id ? null : item.id));
                        }}
                      >
                        <MoreVertical size={13} />
                      </button>

                      {isMenuOpen && (
                        <div className="cmd-more-menu" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="cmd-more-menu-item"
                            onClick={() => {
                              setInspectedItem(item);
                              setActiveMenuId(null);
                            }}
                          >
                            <Info size={14} color="#38bdf8" />
                            <span>Inspect Details</span>
                          </button>

                          <button
                            type="button"
                            className="cmd-more-menu-item"
                            onClick={(e) => handleOpenEditPrice(item, e)}
                          >
                            <Coins size={14} color="#fbbf24" />
                            <span>Edit Price</span>
                          </button>

                          <button
                            type="button"
                            className="cmd-more-menu-item"
                            onClick={(e) => {
                              toggleFeaturedItem(item.id, e);
                              setActiveMenuId(null);
                            }}
                          >
                            <Star size={14} color="#c084fc" />
                            <span>{isFeatured ? 'Unset Featured' : 'Set Featured'}</span>
                          </button>

                          <button
                            type="button"
                            className="cmd-more-menu-item"
                            onClick={(e) => {
                              handleToggleActive(item, e);
                              setActiveMenuId(null);
                            }}
                          >
                            {item.active ? <EyeOff size={14} color="#94a3b8" /> : <Eye size={14} color="#10b981" />}
                            <span>{item.active ? 'Deactivate' : 'Activate'}</span>
                          </button>

                          <button
                            type="button"
                            className="cmd-more-menu-item"
                            onClick={(e) => handleDuplicateItem(item, e)}
                          >
                            <Copy size={14} color="#38bdf8" />
                            <span>Duplicate Item</span>
                          </button>

                          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '0.2rem 0' }} />

                          <button
                            type="button"
                            className="cmd-more-menu-item danger"
                            onClick={(e) => handleDeleteItem(item, e)}
                          >
                            <Trash2 size={14} />
                            <span>Delete Item</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. FLOATING BULK ACTIONS TOOLBAR */}
      {selectedIds.size > 0 && (
        <div className="cmd-bulk-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f8fafc', fontWeight: 700, fontSize: '0.85rem' }}>
            <CheckSquare size={16} color="#38bdf8" />
            <span>{selectedIds.size} Selected</span>
          </div>

          <div style={{ height: '16px', width: '1px', background: 'rgba(255, 255, 255, 0.2)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className="cmd-action-btn"
              onClick={() => handleBulkActivate(true)}
            >
              <Eye size={14} color="#10b981" />
              <span>Activate</span>
            </button>

            <button
              type="button"
              className="cmd-action-btn"
              onClick={() => handleBulkActivate(false)}
            >
              <EyeOff size={14} color="#94a3b8" />
              <span>Deactivate</span>
            </button>

            <button
              type="button"
              className="cmd-action-btn"
              onClick={() => handleBulkFeatured(true)}
            >
              <Star size={14} color="#fbbf24" />
              <span>Feature</span>
            </button>

            <button
              type="button"
              className="cmd-action-btn danger"
              onClick={handleBulkDelete}
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>

            <button
              type="button"
              className="cmd-action-btn"
              style={{ background: 'transparent', borderColor: 'transparent', color: '#94a3b8' }}
              onClick={() => setSelectedIds(new Set())}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 7. CREATE NEW ITEM MODAL WITH LIVE PREVIEW */}
      {showCreateModal && (
        <div className="cmd-create-modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="cmd-create-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="cmd-sheet-drag-handle" />
            <div className="cmd-create-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Sparkles size={20} color="#38bdf8" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  Forge New Cosmetic Item
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="cmd-create-split-body">
              {/* Form Controls */}
              <form onSubmit={handleCreateItem} className="cmd-create-form-side">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.3rem' }}>
                      Item Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Phoenix Blade"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                      className="cmd-market-search-input"
                      style={{ paddingLeft: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.3rem' }}>
                      Price (Gold Coins) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      required
                      className="cmd-market-search-input"
                      style={{ paddingLeft: '0.85rem', color: '#fbbf24', fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.3rem' }}>
                      Category
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="cmd-market-select"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    >
                      <option value="Weapon">Weapon</option>
                      <option value="Armor">Armor</option>
                      <option value="Consumable">Consumable</option>
                      <option value="Cosmetic">Cosmetic</option>
                      <option value="Title">Title</option>
                      <option value="Themes">Themes</option>
                      <option value="Avatars">Avatars</option>
                      <option value="Badges">Badges</option>
                      <option value="Frames">Frames</option>
                      <option value="Effects">Effects</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.3rem' }}>
                      Rarity
                    </label>
                    <select
                      value={formRarity}
                      onChange={(e) => setFormRarity(e.target.value)}
                      className="cmd-market-select"
                      style={{ width: '100%', boxSizing: 'border-box', color: getRarityColor(formRarity), fontWeight: 700 }}
                    >
                      <option value="common">Common</option>
                      <option value="uncommon">Uncommon</option>
                      <option value="rare">Rare</option>
                      <option value="epic">Epic</option>
                      <option value="legendary">Legendary</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.3rem' }}>
                      Icon / Asset Key
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. swords, shield, theme, fire, star"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      className="cmd-market-search-input"
                      style={{ paddingLeft: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.3rem' }}>
                      Display Order
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formDisplayOrder}
                      onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                      className="cmd-market-search-input"
                      style={{ paddingLeft: '0.85rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.3rem' }}>
                    Item Description & Lore *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe this cosmetic item and its backstory..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    required
                    className="cmd-market-search-input"
                    style={{ paddingLeft: '0.85rem', resize: 'vertical' }}
                  />
                </div>

                {/* Toggles */}
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    <input
                      type="checkbox"
                      checked={formActive}
                      onChange={(e) => setFormActive(e.target.checked)}
                      style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
                    />
                    <span>Active in Shop Catalog</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#fbbf24' }}>
                    <input
                      type="checkbox"
                      checked={formFeatured}
                      onChange={(e) => setFormFeatured(e.target.checked)}
                      style={{ accentColor: '#fbbf24', width: '16px', height: '16px' }}
                    />
                    <span>Mark as Featured</span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="cmd-action-btn"
                    style={{ padding: '0.65rem 1.25rem' }}
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
                      boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                    }}
                  >
                    {isCreating ? <Loader2 size={16} className="animate-spin" /> : <PackageCheck size={16} />}
                    <span>Save & Publish to Shop</span>
                  </button>
                </div>
              </form>

              {/* Live Preview Panel */}
              <div className="cmd-create-preview-side">
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', fontWeight: 700 }}>
                  Live Shop Card Preview
                </span>

                <div 
                  className={`cmd-market-card rarity-${formRarity.toLowerCase()} ${formFeatured ? 'is-featured' : ''}`}
                  style={{ width: '280px', pointerEvents: 'none' }}
                >
                  <div className="cmd-market-preview" style={{ height: '110px' }}>
                    <div 
                      className="cmd-preview-aura"
                      style={{ background: getRarityColor(formRarity) }}
                    />
                    {formFeatured && (
                      <div className="cmd-card-featured-badge">
                        <Star size={11} fill="#fbbf24" color="#fbbf24" />
                        <span>Featured</span>
                      </div>
                    )}
                    <div className="cmd-market-icon-frame">
                      {getAssetIcon(formCategory, formImageUrl, formRarity)}
                    </div>
                  </div>

                  <div className="cmd-market-card-body" style={{ padding: '0.85rem' }}>
                    <div className="cmd-market-card-title" style={{ fontSize: '0.95rem' }}>
                      <span>{formName || 'Item Name Preview'}</span>
                    </div>

                    <div className="cmd-market-meta-line">
                      <span 
                        className="cmd-rarity-tag"
                        style={{ 
                          color: getRarityColor(formRarity),
                          backgroundColor: `${getRarityColor(formRarity)}18`,
                          border: `1px solid ${getRarityColor(formRarity)}40`,
                        }}
                      >
                        {formRarity}
                      </span>
                      <span style={{ color: '#475569' }}>•</span>
                      <span className="cmd-category-tag">{formCategory}</span>
                    </div>

                    <p className="cmd-market-desc" style={{ minHeight: 'auto', fontSize: '0.78rem' }}>
                      {formDescription || 'Item description and lore will be previewed here.'}
                    </p>
                  </div>

                  <div className="cmd-market-card-footer" style={{ padding: '0.65rem 0.85rem' }}>
                    <div className="cmd-price-badge" style={{ fontSize: '0.82rem' }}>
                      <Coins size={14} />
                      <span>{formPrice || 0} G</span>
                    </div>

                    <span style={{ fontSize: '0.75rem', color: formActive ? '#10b981' : '#64748b', fontWeight: 600 }}>
                      {formActive ? 'Active in Shop' : 'Deactivated'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. EDIT PRICE MODAL */}
      {editingPriceItem && (
        <div className="cmd-create-modal-backdrop" onClick={() => setEditingPriceItem(null)}>
          <div className="cmd-price-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="cmd-sheet-drag-handle" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Coins size={20} color="#fbbf24" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  Adjust Price
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPriceItem(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0 0 1rem 0' }}>
              Set new authoritative gold coin requirement for <strong style={{ color: '#f8fafc' }}>{editingPriceItem.name}</strong>.
            </p>

            <form onSubmit={handleSavePrice} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#94a3b8' }}>Current Price:</span>
                  <strong style={{ color: '#cbd5e1' }}>{editingPriceItem.price} Gold</strong>
                </div>

                <input
                  type="number"
                  min={0}
                  value={editPriceVal}
                  onChange={(e) => setEditPriceVal(Number(e.target.value))}
                  className="cmd-market-search-input"
                  style={{
                    paddingLeft: '0.85rem',
                    color: '#fbbf24',
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    textAlign: 'center',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                  autoFocus
                />

                {/* Quick Increment Chips */}
                <div className="cmd-price-quick-btns">
                  <button
                    type="button"
                    className="cmd-quick-step-btn"
                    onClick={() => setEditPriceVal(prev => Math.max(0, prev - 50))}
                  >
                    -50 G
                  </button>
                  <button
                    type="button"
                    className="cmd-quick-step-btn"
                    onClick={() => setEditPriceVal(prev => prev + 10)}
                  >
                    +10 G
                  </button>
                  <button
                    type="button"
                    className="cmd-quick-step-btn"
                    onClick={() => setEditPriceVal(prev => prev + 50)}
                  >
                    +50 G
                  </button>
                  <button
                    type="button"
                    className="cmd-quick-step-btn"
                    onClick={() => setEditPriceVal(prev => prev + 100)}
                  >
                    +100 G
                  </button>
                </div>
              </div>

              {/* Difference Preview */}
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: 'rgba(10, 15, 28, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: '#94a3b8' }}>Delta Adjustment:</span>
                <span
                  style={{
                    fontWeight: 700,
                    color: editPriceVal > editingPriceItem.price ? '#10b981' : editPriceVal < editingPriceItem.price ? '#ef4444' : '#94a3b8',
                  }}
                >
                  {editPriceVal > editingPriceItem.price ? `+${editPriceVal - editingPriceItem.price} G` : `${editPriceVal - editingPriceItem.price} G`}
                </span>
              </div>

              {priceError && (
                <span style={{ color: '#fca5a5', fontSize: '0.8rem' }}>{priceError}</span>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingPriceItem(null)}
                  className="cmd-action-btn"
                  style={{ flex: 1, padding: '0.65rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPrice}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: isUpdatingPrice ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                >
                  {isUpdatingPrice ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  <span>Save Price</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. ITEM DETAILS SLIDE-OVER DRAWER */}
      {inspectedItem && (
        <div className="cmd-create-modal-backdrop" onClick={() => setInspectedItem(null)}>
          <div className="cmd-item-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cmd-sheet-drag-handle" />
            {/* Drawer Header */}
            <div className="cmd-drawer-header">
              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', fontWeight: 700 }}>
                  Cosmetic Inspection
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0.2rem 0 0 0' }}>
                  {inspectedItem.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectedItem(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Preview Banner */}
            <div className="cmd-item-drawer-preview">
              <div 
                className="cmd-preview-aura"
                style={{ background: getRarityColor(inspectedItem.rarity), width: '120px', height: '120px', opacity: 0.6 }}
              />
              <div className="cmd-market-icon-frame" style={{ width: '80px', height: '80px' }}>
                {getAssetIcon(inspectedItem.category || inspectedItem.itemType, inspectedItem.imageUrl, inspectedItem.rarity)}
              </div>
            </div>

            {/* Drawer Body */}
            <div className="cmd-drawer-body">
              {/* Status and Rarity Pill line */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span 
                  className="cmd-rarity-tag"
                  style={{ 
                    color: getRarityColor(inspectedItem.rarity),
                    backgroundColor: `${getRarityColor(inspectedItem.rarity)}20`,
                    border: `1px solid ${getRarityColor(inspectedItem.rarity)}40`,
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.65rem',
                  }}
                >
                  {inspectedItem.rarity.toUpperCase()}
                </span>

                <span 
                  style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#e2e8f0',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {inspectedItem.category || inspectedItem.itemType || 'Cosmetic'}
                </span>

                {featuredIds.has(inspectedItem.id) && (
                  <span 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '4px',
                      background: 'rgba(251, 191, 36, 0.15)',
                      border: '1px solid rgba(251, 191, 36, 0.35)',
                      color: '#fbbf24',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    <Star size={12} fill="#fbbf24" color="#fbbf24" />
                    Featured
                  </span>
                )}

                <span 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '4px',
                    background: inspectedItem.active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                    border: inspectedItem.active ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(100, 116, 139, 0.35)',
                    color: inspectedItem.active ? '#10b981' : '#94a3b8',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {inspectedItem.active && <span className="cmd-active-pulse-dot" />}
                  {inspectedItem.active ? 'Active in Shop' : 'Deactivated'}
                </span>
              </div>

              {/* Lore & Description */}
              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  Description & Lore
                </span>
                <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.5, background: 'rgba(10, 15, 28, 0.6)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', margin: 0 }}>
                  {inspectedItem.description}
                </p>
              </div>

              {/* Metadata Table */}
              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  Database Metadata
                </span>
                <table className="cmd-meta-table">
                  <tbody>
                    <tr>
                      <td className="cmd-meta-label">UUID</td>
                      <td className="cmd-meta-val">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#94a3b8' }}>
                            {inspectedItem.id}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(inspectedItem.id, 'Item UUID')}
                            style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: 0 }}
                            title="Copy UUID"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="cmd-meta-label">Gold Price</td>
                      <td className="cmd-meta-val" style={{ color: '#fbbf24' }}>
                        {inspectedItem.price} G
                      </td>
                    </tr>
                    <tr>
                      <td className="cmd-meta-label">Asset Key</td>
                      <td className="cmd-meta-val">
                        <code>{inspectedItem.imageUrl || 'default'}</code>
                      </td>
                    </tr>
                    <tr>
                      <td className="cmd-meta-label">Display Order</td>
                      <td className="cmd-meta-val">{inspectedItem.displayOrder}</td>
                    </tr>
                    <tr>
                      <td className="cmd-meta-label">Created Date</td>
                      <td className="cmd-meta-val">
                        {new Date(inspectedItem.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="cmd-drawer-footer">
              <button
                type="button"
                className="cmd-action-btn"
                onClick={() => handleToggleActive(inspectedItem)}
              >
                {inspectedItem.active ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{inspectedItem.active ? 'Deactivate' : 'Activate'}</span>
              </button>

              <button
                type="button"
                className="cmd-action-btn"
                onClick={() => handleOpenEditPrice(inspectedItem)}
              >
                <Coins size={14} color="#fbbf24" />
                <span>Edit Price</span>
              </button>

              <button
                type="button"
                className="cmd-action-btn"
                onClick={() => toggleFeaturedItem(inspectedItem.id)}
              >
                <Star size={14} color="#fbbf24" />
                <span>{featuredIds.has(inspectedItem.id) ? 'Unfeature' : 'Feature'}</span>
              </button>

              <button
                type="button"
                className="cmd-action-btn danger"
                onClick={() => handleDeleteItem(inspectedItem)}
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. DELETE CONFIRMATION MODAL */}
      <WindowPopModal
        isOpen={Boolean(deleteTargetItem)}
        onClose={() => setDeleteTargetItem(null)}
        onConfirm={confirmDeleteItem}
        isLoading={isDeletingItem}
        title="Delete Market Item?"
        message={
          deleteTargetItem ? (
            <span>
              Are you sure you want to permanently delete <strong style={{ color: '#f8fafc' }}>{deleteTargetItem.name}</strong> from the Citadel market catalog? This cannot be undone.
            </span>
          ) : ''
        }
        type="danger"
        confirmText="Delete Item"
        cancelText="Cancel"
      />

      {/* 11. WINDOW POP ALERT */}
      {popAlert && (
        <WindowPopModal
          isOpen={Boolean(popAlert)}
          onClose={() => setPopAlert(null)}
          title={popAlert.title}
          message={popAlert.message}
          type={popAlert.type || 'info'}
        />
      )}

      {/* 12. TOAST NOTIFICATION CONTAINER */}
      <div className="cmd-toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`cmd-toast ${t.type}`}>
            {t.type === 'success' && <CheckCircle2 size={18} color="#10b981" />}
            {t.type === 'error' && <AlertTriangle size={18} color="#ef4444" />}
            {t.type === 'info' && <Info size={18} color="#38bdf8" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

