import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { ThemeContext } from '../../context/themeContextDef';
import { applyThemeColors } from '../themes/applyTheme';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';
import { 
  Settings as SettingsIcon, 
  Palette, 
  User, 
  LogOut, 
  Check, 
  Shield,
  Award,
  Zap,
  Coins,
  Camera,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Lock,
  Compass,
  ArrowUpRight,
  AlertTriangle,
  X
} from 'lucide-react';
import { useShop } from '../../context/useShop';
import { authApi } from '../../services/api/auth';
import './settings-center.css';

interface HudThemeDef {
  key: string;
  slug: string;
  name: string;
  desc: string;
  border: string;
  glow: string;
  bgMock: string;
  accent: string;
}

const PREGIVEN_HUD_THEMES: HudThemeDef[] = [
  { 
    key: 'default', 
    slug: 'dark-citadel', 
    name: 'Dark Citadel', 
    desc: 'Midnight obsidian with sky-blue tactical HUD', 
    border: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.35)',
    bgMock: '#090C10',
    accent: '#38bdf8'
  },
  { 
    key: 'neon_outpost', 
    slug: 'neon-outpost', 
    name: 'Neon Outpost', 
    desc: 'Deep cyber-void with electric fuchsia and cyan accents', 
    border: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.35)',
    bgMock: '#07070F',
    accent: '#d946ef'
  },
  { 
    key: 'mystic_forest', 
    slug: 'mystic-forest', 
    name: 'Mystic Forest', 
    desc: 'Dark emerald grove with ancient glowing runes', 
    border: '#10b981',
    glow: 'rgba(16, 185, 129, 0.35)',
    bgMock: '#07100B',
    accent: '#34d399'
  },
  { 
    key: 'solaris_gold', 
    slug: 'solaris-gold', 
    name: 'Solaris Gold', 
    desc: 'Celestial warmth with golden amber and solar radiance', 
    border: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.35)',
    bgMock: '#100D0A',
    accent: '#fb923c'
  },
];

/**
 * Compresses and square-center-crops any chosen image to 128x128 using HTML5 Canvas.
 * Outputs a compact Base64 Data URL (~3-6KB) ready for database storage.
 */
function compressImageTo128(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context initialization failed.'));
          return;
        }

        // Center square crop
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 128, 128);

        try {
          const webpDataUrl = canvas.toDataURL('image/webp', 0.85);
          if (webpDataUrl.startsWith('data:image/webp')) {
            resolve(webpDataUrl);
            return;
          }
        } catch {
          // Fallback if browser does not support webp canvas export
        }

        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => reject(new Error('Failed to load selected image file.'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

export const SettingsPage: React.FC = () => {
  useDocumentMetadata('Citadel Settings', { noindex: true });

  const { user, character, logout, updateProfile } = useAuth();
  const { inventory } = useShop();
  const themeContext = useContext(ThemeContext);
  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isEquippingKey, setIsEquippingKey] = useState<string | null>(null);

  // Active badge: user.badge from backend or any owned badge from shop inventory
  const ownedBadgeItem = inventory?.find(
    (i) =>
      i.shopItem?.itemType === 'BADGE' ||
      (i.itemId || i.shopItemId)?.startsWith('badge_')
  );
  const activeBadge =
    user?.badge ||
    (ownedBadgeItem
      ? {
          id: ownedBadgeItem.id,
          name: ownedBadgeItem.shopItem?.name || 'Shadow Badge',
          icon: '/assets/items/badge_shadow.svg',
          sku: ownedBadgeItem.shopItem?.sku || 'badge_shadow',
        }
      : null);

  // Identity editing state
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Account deletion state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    const requiredPhrase = (user?.displayName || 'delete my account').trim();
    if (deleteConfirmInput.trim() !== requiredPhrase) {
      setDeleteError(`You must type "${requiredPhrase}" exactly to confirm.`);
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);
    try {
      await authApi.deleteAccount();
      await logout();
      navigate('/register', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete account. Please try again.';
      setDeleteError(msg);
      setIsDeleting(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state when user object loads or updates
  useEffect(() => {
    if (user?.displayName && !displayName) {
      setDisplayName(user.displayName);
    }
    if (user?.avatarUrl !== undefined) {
      setAvatarPreview(user.avatarUrl);
    }
  }, [user, displayName]);

  const handleSelectTheme = async (themeDef: HudThemeDef) => {
    setIsEquippingKey(themeDef.key);
    try {
      // 1. Immediately set data-theme attribute on document root & body
      document.documentElement.setAttribute('data-theme', themeDef.key);
      if (typeof document !== 'undefined' && document.body) {
        document.body.setAttribute('data-theme', themeDef.key);
      }

      // 2. Persist to local storage
      try {
        localStorage.setItem('liferpg_active_theme_id', themeDef.slug);
      } catch {
        // Ignore
      }

      // 3. Apply full design token CSS variables
      applyThemeColors(themeDef.slug);

      // 4. If ThemeContext is available, equip in context and Supabase/DB
      if (themeContext?.equipTheme) {
        const targetTheme = themeContext.themes.find(t => 
          t.slug === themeDef.slug || 
          t.slug === themeDef.key ||
          t.id === themeDef.slug || 
          t.name.toLowerCase() === themeDef.name.toLowerCase()
        );

        if (targetTheme) {
          await themeContext.equipTheme(targetTheme);
        }
      }

      // 5. Ensure data-theme remains themeDef.key for exact test contract match
      document.documentElement.setAttribute('data-theme', themeDef.key);
    } finally {
      setIsEquippingKey(null);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({ type: 'error', text: 'Please select a valid image file (PNG, JPG, WEBP).' });
      return;
    }

    setIsCompressing(true);
    setStatusMessage(null);

    try {
      const compressedDataUrl = await compressImageTo128(file);
      setAvatarPreview(compressedDataUrl);
      setStatusMessage({ 
        type: 'success', 
        text: 'Avatar compressed to 128x128! Click "Save Profile Changes" to store it in your database account.' 
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to process image.' });
    } finally {
      setIsCompressing(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setStatusMessage({ 
      type: 'success', 
      text: 'Avatar cleared. Click "Save Profile Changes" to remove it from your database profile.' 
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = displayName.trim();

    if (trimmedName.length < 2) {
      setStatusMessage({ type: 'error', text: 'Display name must be at least 2 characters.' });
      return;
    }

    if (trimmedName.length > 50) {
      setStatusMessage({ type: 'error', text: 'Display name cannot exceed 50 characters.' });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      if (updateProfile) {
        await updateProfile({
          displayName: trimmedName,
          avatarUrl: avatarPreview,
        });
      }
      setStatusMessage({ 
        type: 'success', 
        text: 'Profile updated successfully! Name and 128x128 avatar saved to database.' 
      });
    } catch (err: any) {
      setStatusMessage({ 
        type: 'error', 
        text: err?.message || 'Failed to save changes. Please try again.' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasUnsavedChanges = 
    (displayName.trim() !== (user?.displayName || '')) || 
    (avatarPreview !== (user?.avatarUrl || null));

  // Progression metrics calculations
  const currentLevel = character?.level || 1;
  const currentXp = character?.totalXp || 0;
  const currentGold = character?.gold ?? 0;
  const nextRankXpThreshold = Math.max(100, currentLevel * 100);
  const currentLevelProgressXp = currentXp % nextRankXpThreshold;
  const xpPercent = Math.min(100, Math.max(6, Math.round((currentLevelProgressXp / nextRankXpThreshold) * 100)));

  return (
    <div className="settings-command-center">
      {/* Ambient background depth glow */}
      <div className="settings-ambient-glow" aria-hidden="true" />

      {/* 1. Header HUD Introduction */}
      <header className="settings-header-hud anim-deck-1">
        <div className="settings-header-top">
          <div className="settings-brand-cluster">
            <div className="settings-header-icon-bay">
              <SettingsIcon size={24} color="#38bdf8" />
            </div>
            <div>
              <h1 className="settings-title">
                Citadel Settings
              </h1>
              <p className="settings-subtitle">
                The Adventurer Control Center &bull; Manage your identity, progression, and world.
              </p>
            </div>
          </div>
          <div className="settings-deck-badge cyan">
            <Compass size={13} />
            <span>AUTHORITATIVE REALM HUD</span>
          </div>
        </div>
        <div className="settings-hud-decorative-line" />
      </header>

      {/* Status Notification Toast */}
      {statusMessage && (
        <div
          role="status"
          style={{
            padding: '0.85rem 1.15rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: statusMessage.type === 'success' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
            color: statusMessage.type === 'success' ? '#34d399' : '#fca5a5',
            fontSize: '0.88rem',
            fontWeight: 500,
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            animation: 'deckSlideFade 0.25s ease',
          }}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0 }} />
          ) : (
            <AlertCircle size={18} color="#fca5a5" style={{ flexShrink: 0 }} />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* 2. SECTION 1: ADVENTURER IDENTITY & PROGRESSION HUD */}
      <section aria-labelledby="identity-deck-heading" className="settings-deck-card anim-deck-2">
        <div className="settings-deck-header">
          <div className="settings-deck-title-wrap">
            <User size={20} color="#38bdf8" />
            <h2 id="identity-deck-heading" className="settings-deck-title">Adventurer Identity</h2>
          </div>
          <span className="settings-deck-badge cyan">
            Persistent Database Profile
          </span>
        </div>

        <form onSubmit={handleSaveProfile}>
          <div className="profile-command-grid">
            {/* 2A. LEFT: Avatar Frame & Actions */}
            <div className="avatar-identity-bay">
              <div 
                className="avatar-interactive-frame"
                onClick={() => fileInputRef.current?.click()}
                title="Click to change profile picture"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    fileInputRef.current?.click();
                  }
                }}
              >
                <div className="avatar-image-viewport">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile Avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <User size={52} color="#38bdf8" />
                  )}

                  {isCompressing ? (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                    }}>
                      <Loader2 size={24} className="animate-spin" color="#38bdf8" />
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>128×128...</span>
                    </div>
                  ) : (
                    <div className="avatar-hover-overlay">
                      <Camera size={18} />
                      <span>Change avatar</span>
                    </div>
                  )}
                </div>

                <div className="avatar-camera-pill" title="Change picture">
                  <Camera size={15} />
                </div>
              </div>

              {/* Hidden File Input for Image Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                aria-label="Upload profile picture"
              />

              <div className="avatar-actions-stack">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSaving || isCompressing}
                  className="avatar-btn avatar-btn-upload"
                  id="upload-pfp-btn"
                >
                  <Camera size={15} />
                  <span>Upload Picture</span>
                </button>

                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={isSaving || isCompressing}
                    className="avatar-btn avatar-btn-remove"
                    id="remove-pfp-btn"
                  >
                    <Trash2 size={14} />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <p className="avatar-spec-note">
                Upload JPG, PNG, or WEBP. Automatically cropped to an optimized <strong>128×128</strong> format and stored permanently in Citadel database.
              </p>
            </div>

            {/* 2B. CENTER: Core Identity Fields */}
            <div className="profile-fields-bay">
              {/* Display Name */}
              <div className="field-group">
                <div className="field-header-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label htmlFor="settings-display-name" className="field-label">
                      <span>Display Name</span>
                    </label>
                    {activeBadge && (
                      <span
                        className="profile-badge-tag"
                        title={`${activeBadge.name} (Badge)`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(88, 28, 135, 0.45))',
                          border: '1px solid rgba(168, 85, 247, 0.5)',
                          borderRadius: '12px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: '#e9d5ff',
                          letterSpacing: '0.02em',
                        }}
                      >
                        <img
                          src={activeBadge.icon || '/assets/items/badge_shadow.svg'}
                          alt={activeBadge.name}
                          style={{ width: '13px', height: '13px', objectFit: 'contain' }}
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                        <span>{activeBadge.name}</span>
                      </span>
                    )}
                  </div>
                  <span className="field-counter">
                    {displayName.length}/50
                  </span>
                </div>
                <input
                  id="settings-display-name"
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Enter hero name..."
                  maxLength={50}
                  required
                  className="field-input-control"
                />
                <p className="field-helper-text">
                  How other adventurers see you across the Citadel realm.
                </p>
              </div>

              {/* Account Email (Read-Only) */}
              <div className="field-group">
                <span className="field-label">
                  <Lock size={12} style={{ opacity: 0.7 }} />
                  <span>Account Email</span>
                </span>
                <div className="field-readonly-control">
                  <span>{user?.email || 'user@example.com'}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Immutable</span>
                </div>
                <p className="field-helper-text">
                  Used for account communication and Citadel authentication.
                </p>
              </div>

              {/* Hero Title / Bestowed Honor */}
              <div className="field-group">
                <span className="field-label">
                  <Award size={13} style={{ color: '#fbbf24' }} />
                  <span>Hero Title / Bestowed Honor</span>
                </span>
                <div className="field-title-badge-control">
                  <Award size={18} color="#fbbf24" style={{ flexShrink: 0 }} />
                  <span>{user?.title || character?.title || 'Novice Adventurer'}</span>
                </div>
                <p className="field-helper-text">
                  Your current bestowed honor and realm prestige.
                </p>
              </div>
            </div>

            {/* 2C. RIGHT: Compact RPG Progression HUD */}
            <div className="progression-hud-bay">
              <div className="progression-hud-header">
                <span className="progression-hud-title">
                  <Zap size={14} />
                  <span>Progression HUD</span>
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                  REALM SYNCED
                </span>
              </div>

              {/* Level Metric */}
              <div className="hud-metric-row">
                <div className="hud-metric-box">
                  <div className="hud-metric-top">
                    <span className="hud-metric-label">
                      <Zap size={13} color="#38bdf8" />
                      <span>Level</span>
                    </span>
                    <span className="hud-metric-value" style={{ color: '#38bdf8' }}>
                      Level {currentLevel}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Rank {currentLevel} Adventurer
                  </span>
                  <div className="hud-tooltip">
                    Authoritative rank in Citadel registry
                  </div>
                </div>
              </div>

              {/* XP Gauge Metric */}
              <div className="hud-metric-row">
                <div className="hud-metric-box">
                  <div className="hud-metric-top">
                    <span className="hud-metric-label">
                      <Sparkles size={13} color="#c084fc" />
                      <span>Experience</span>
                    </span>
                    <span className="hud-metric-value" style={{ color: '#c084fc' }}>
                      {currentXp} XP
                    </span>
                  </div>
                  <div className="mini-xp-track" title={`${currentLevelProgressXp} / ${nextRankXpThreshold} XP towards next rank`}>
                    <div 
                      className="mini-xp-fill" 
                      style={{ width: `${xpPercent}%` }} 
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                    <span>Progress</span>
                    <span>{xpPercent}%</span>
                  </div>
                  <div className="hud-tooltip">
                    {currentXp} total XP earned through quests
                  </div>
                </div>
              </div>

              {/* Citadel Gold Coins Metric */}
              <div className="hud-metric-row">
                <div className="hud-metric-box">
                  <div className="hud-metric-top">
                    <span className="hud-metric-label">
                      <Coins size={13} color="#fbbf24" />
                      <span>Citadel Coins</span>
                    </span>
                    <span className="hud-metric-value" style={{ color: '#fbbf24' }}>
                      {currentGold} Coins
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Spendable Armory Currency
                  </span>
                  <div className="hud-tooltip">
                    Spendable currency for armory & marketplace
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer: Terms & Privacy on Left, Save Button on Right */}
          <div className="settings-deck-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div className="settings-legal-links" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              <Link
                to="/terms"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                Terms of Service
              </Link>
              <span>·</span>
              <Link
                to="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                Privacy Policy
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSaving || isCompressing || !hasUnsavedChanges}
              className="save-profile-btn"
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* 3. SECTION 2: HUD THEME CUSTOMIZER */}
      <section aria-labelledby="theme-customizer-heading" className="settings-deck-card anim-deck-3">
        <div className="settings-deck-header">
          <div className="settings-deck-title-wrap">
            <Palette size={20} color="#a855f7" />
            <h2 id="theme-customizer-heading" className="settings-deck-title">HUD Theme Customizer</h2>
          </div>
          <span className="settings-deck-badge emerald">
            <Sparkles size={12} />
            <span>PRE-GIVEN STARTER THEMES</span>
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', margin: '0 0 1.5rem 0', lineHeight: 1.45 }}>
          Personalize your Life RPG dashboard and workstation. These starter themes are permanently unlocked and ready to equip.
        </p>

        <div className="theme-customizer-grid">
          {PREGIVEN_HUD_THEMES.map(theme => {
            const activeSlug = themeContext?.activeTheme?.slug || (typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : null) || 'dark-citadel';
            const isSelected = 
              activeSlug === theme.slug ||
              activeSlug === theme.key ||
              (theme.key === 'default' && (activeSlug === 'dark-citadel' || activeSlug === 'default')) ||
              (theme.key === 'neon_outpost' && (activeSlug === 'neon-outpost' || activeSlug === 'neon_outpost')) ||
              (theme.key === 'mystic_forest' && (activeSlug === 'mystic-forest' || activeSlug === 'mystic_forest')) ||
              (theme.key === 'solaris_gold' && (activeSlug === 'solaris-gold' || activeSlug === 'solaris_gold'));

            const isProcessing = isEquippingKey === theme.key;

            return (
              <button
                type="button"
                key={theme.key}
                onClick={() => handleSelectTheme(theme)}
                disabled={isProcessing}
                className={`theme-preview-card ${isSelected ? 'selected' : ''}`}
                style={{
                  '--card-theme-border': theme.border,
                  '--card-theme-glow': theme.glow,
                } as React.CSSProperties}
                aria-pressed={isSelected}
              >
                {/* CSS Visual Theme Preview Mockup */}
                <div 
                  className="theme-mockup-screen"
                  style={{
                    background: theme.bgMock,
                    borderColor: isSelected ? theme.border : `${theme.border}33`,
                  }}
                >
                  <div className="mockup-top-bar">
                    <div className="mockup-dot-group">
                      <div className="mockup-dot" style={{ backgroundColor: theme.border }} />
                      <div className="mockup-dot" style={{ backgroundColor: theme.accent }} />
                      <div className="mockup-dot" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
                    </div>
                    <span style={{ fontSize: '0.62rem', color: theme.border, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      HUD
                    </span>
                  </div>
                  <div className="mockup-hud-lines">
                    <div className="mockup-line" style={{ width: '80%', backgroundColor: theme.border }} />
                    <div className="mockup-line" style={{ width: '52%', backgroundColor: theme.accent }} />
                  </div>
                </div>

                <div className="theme-meta-block">
                  <div className="theme-title-row">
                    <span className="theme-title-text" style={{ color: isSelected ? '#ffffff' : 'var(--text-primary)' }}>
                      {theme.name}
                    </span>
                    {isSelected && <Check size={18} color={theme.border} />}
                  </div>
                  <p className="theme-desc-text">
                    {theme.desc}
                  </p>
                  <div className={`theme-status-pill ${isSelected ? 'equipped' : 'ready'}`}>
                    <span>{isSelected ? 'EQUIPPED' : 'READY TO EQUIP'}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'flex-end' }}>
          <Link
            to="/app/themes"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: '#38bdf8',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'transform 0.2s ease, color 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateX(3px)';
              e.currentTarget.style.color = '#7dd3fc';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.color = '#38bdf8';
            }}
          >
            <Palette size={15} />
            <span>Explore All Themes in Citadel Theme Marketplace & Vault</span>
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>

      {/* 4. SECTION 3: SESSION TERMINATION & SECURITY */}
      <section aria-labelledby="session-deck-heading" className="session-deck-card anim-deck-4">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.5rem' }}>
          <Shield size={20} color="#ef4444" />
          <h2 id="session-deck-heading" style={{ fontSize: '1.15rem', color: '#fca5a5', margin: 0, fontFamily: 'var(--font-display)' }}>
            Session Management
          </h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.45 }}>
          End your active Citadel session. Your progression, inventory, and character state are securely stored in the PostgreSQL database.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="session-signout-btn"
          >
            {isLoggingOut ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Invalidating Session...</span>
              </>
            ) : (
              <>
                <LogOut size={16} />
                <span>Sign Out of Life RPG</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setDeleteConfirmInput('');
              setDeleteError(null);
              setIsDeleteModalOpen(true);
            }}
            className="session-delete-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#f87171',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.borderColor = '#ef4444';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.35)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Trash2 size={16} />
            <span>Delete ACC.</span>
          </button>
        </div>
      </section>

      {/* GitHub-Style Delete Account Modal */}
      {isDeleteModalOpen && (
        <div
          className="delete-modal-backdrop"
          onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            className="delete-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '480px',
              width: '100%',
              background: '#0d1117',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '14px',
              padding: '1.75rem',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(239, 68, 68, 0.12)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <AlertTriangle size={20} color="#ef4444" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f87171', fontWeight: 700 }}>
                  Delete Account Permanently
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '8px',
              padding: '0.9rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.84rem',
              lineHeight: 1.5,
              color: '#fca5a5',
            }}>
              <strong>Warning:</strong> This action <u>cannot</u> be undone. This will permanently delete your character, XP level, inventory items, unlocked badges, quest progress, and tavern chat messages.
            </div>

            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', marginBottom: '0.75rem', lineHeight: 1.4 }}>
              To confirm, please type <strong style={{ color: '#f87171', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>{user?.displayName || 'delete my account'}</strong> below:
            </p>

            <input
              type="text"
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
              placeholder={`Type "${user?.displayName || 'delete my account'}" to confirm`}
              disabled={isDeleting}
              autoFocus
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                fontSize: '0.9rem',
                marginBottom: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            {deleteError && (
              <div style={{ color: '#f87171', fontSize: '0.82rem', marginBottom: '1rem' }}>
                {deleteError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmInput('');
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#cbd5e1',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmInput.trim() !== (user?.displayName || 'delete my account').trim()}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  background: deleteConfirmInput.trim() === (user?.displayName || 'delete my account').trim() ? '#dc2626' : 'rgba(220, 38, 38, 0.25)',
                  border: '1px solid rgba(220, 38, 38, 0.5)',
                  color: deleteConfirmInput.trim() === (user?.displayName || 'delete my account').trim() ? '#fff' : '#9ca3af',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: deleteConfirmInput.trim() === (user?.displayName || 'delete my account').trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Deleting Account...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    <span>I understand the consequences, delete my account</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
