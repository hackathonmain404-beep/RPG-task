import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, Sparkles, Palette, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/useTheme';
import { useAuth } from '../../context/useAuth';
import type { Theme } from './types';
import { ThemeCard } from './components/ThemeCard';
import { ThemesSkeleton } from '../../components/skeletons/ThemesSkeleton';
import { ErrorState } from '../../components/common/ErrorState';
import './theme-marketplace.css';

export const ThemeMarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const { themes, isOwned, isEquipped, purchaseTheme, equipTheme, isLoading, error, refreshThemes } = useTheme();
  const { user, character } = useAuth();

  const [activeTab, setActiveTab] = useState<'marketplace' | 'collection'>('marketplace');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const playerGold = character?.gold ?? 0;
  const isAuthenticated = Boolean(user);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(prev => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const handleAcquire = async (theme: Theme) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (playerGold < theme.price) {
      showToast('error', 'Not enough Gold.');
      return;
    }

    const res = await purchaseTheme(theme);
    if (res.success) {
      showToast('success', `${theme.name} acquired!`);
    } else {
      showToast('error', res.error || 'Failed to acquire theme.');
    }
  };

  const handleEquip = async (theme: Theme) => {
    await equipTheme(theme);
    showToast('success', `${theme.name} equipped.`);
  };

  // Filter themes
  const filteredThemes = useMemo(() => {
    let list = themes;

    // Filter by tab (marketplace vs collection)
    if (activeTab === 'collection') {
      list = list.filter(t => isOwned(t.slug) || isOwned(t.id));
    }

    // Filter by rarity
    if (selectedRarity !== 'all') {
      list = list.filter(t => t.rarity.toLowerCase() === selectedRarity.toLowerCase());
    }

    return list;
  }, [themes, activeTab, selectedRarity, isOwned]);

  const ownedCount = useMemo(() => {
    return themes.filter(t => isOwned(t.slug) || isOwned(t.id)).length;
  }, [themes, isOwned]);

  if (isLoading && themes.length === 0) {
    return (
      <div className="theme-marketplace-root">
        <ThemesSkeleton />
      </div>
    );
  }

  if (error && themes.length === 0) {
    return (
      <div className="theme-marketplace-root" style={{ padding: '2rem 1rem' }}>
        <ErrorState
          title="Citadel Theme Registry Unavailable"
          message={error}
          onRetry={refreshThemes}
        />
      </div>
    );
  }

  return (
    <div className="theme-marketplace-root">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 9999,
            backgroundColor: toastMessage.type === 'success' ? '#064e3b' : '#7f1d1d',
            color: '#f8fafc',
            border: `1px solid ${toastMessage.type === 'success' ? '#10b981' : '#ef4444'}`,
            borderRadius: '10px',
            padding: '0.85rem 1.4rem',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.88rem',
            fontWeight: 600,
            animation: 'armoryGridFadeIn 0.25s ease',
          }}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} color="#34d399" /> : <AlertCircle size={18} color="#f87171" />}
          {toastMessage.text}
        </div>
      )}

      {/* Header & HUD */}
      <header className="theme-market-header">
        <div className="theme-market-titles">
          <span className="theme-market-eyebrow">
            <Palette size={14} />
            CITADEL ARMORY • THEME SYSTEM
          </span>
          <h1 className="theme-market-title">Theme Marketplace</h1>
          <p className="theme-market-subtitle">
            Personalize your Life RPG dashboard and workstation with atmospheric custom themes.
          </p>
        </div>

        {/* Player Currency HUD */}
        <div className="theme-market-hud">
          <div className="theme-hud-gold-badge" title="Authoritative Player Treasury">
            <Coins size={18} className="theme-hud-gold-icon" />
            <span className="theme-hud-gold-amount">{playerGold.toLocaleString()}</span>
            <span className="theme-hud-gold-label">GOLD</span>
          </div>
        </div>
      </header>

      {/* Navigation Tabs & Filters */}
      <div className="theme-market-tabs-row">
        {/* Tabs */}
        <div className="theme-market-tabs">
          <button
            type="button"
            className={`theme-market-tab ${activeTab === 'marketplace' ? 'active' : ''}`}
            onClick={() => setActiveTab('marketplace')}
          >
            <Sparkles size={15} />
            Marketplace ({themes.length})
          </button>
          <button
            type="button"
            className={`theme-market-tab ${activeTab === 'collection' ? 'active' : ''}`}
            onClick={() => setActiveTab('collection')}
          >
            <Layers size={15} />
            My Collection ({ownedCount})
          </button>
        </div>

        {/* Rarity Filter */}
        <div className="theme-market-filters">
          <select
            className="theme-filter-select"
            value={selectedRarity}
            onChange={e => setSelectedRarity(e.target.value)}
            aria-label="Filter by rarity"
          >
            <option value="all">All Rarities</option>
            <option value="common">Common</option>
            <option value="uncommon">Uncommon</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
          </select>
        </div>
      </div>

      {/* Grid Content */}
      {filteredThemes.length === 0 ? (
        <div className="theme-empty-state">
          <Palette size={40} color="#64748b" />
          <h3 className="theme-empty-title">
            {activeTab === 'collection' ? 'No themes in your collection yet' : 'No themes match your criteria'}
          </h3>
          <p className="theme-empty-text">
            {activeTab === 'collection'
              ? 'Acquire themes from the marketplace to customize your workstation.'
              : 'Try clearing your rarity filter to view available themes.'}
          </p>
          {activeTab === 'collection' && (
            <button
              type="button"
              className="theme-btn theme-btn-acquire"
              onClick={() => setActiveTab('marketplace')}
            >
              Browse Marketplace
            </button>
          )}
        </div>
      ) : (
        <div className="theme-market-grid">
          {filteredThemes.map((theme, index) => (
            <ThemeCard
              key={theme.slug || theme.id}
              theme={theme}
              isOwned={isOwned(theme.slug) || isOwned(theme.id)}
              isEquipped={isEquipped(theme.slug) || isEquipped(theme.id)}
              playerGold={playerGold}
              isAuthenticated={isAuthenticated}
              onAcquire={handleAcquire}
              onEquip={handleEquip}
              onRequireAuth={() => navigate('/login')}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
};
