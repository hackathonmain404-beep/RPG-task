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
  Sparkles
} from 'lucide-react';

const PREGIVEN_HUD_THEMES = [
  { key: 'default', slug: 'dark-citadel', name: 'Dark Citadel', desc: 'Midnight obsidian with sky-blue tactical HUD', border: '#38bdf8' },
  { key: 'neon_outpost', slug: 'neon-outpost', name: 'Neon Outpost', desc: 'Deep cyber-void with electric fuchsia and cyan accents', border: '#06b6d4' },
  { key: 'mystic_forest', slug: 'mystic-forest', name: 'Mystic Forest', desc: 'Dark emerald grove with ancient glowing runes', border: '#10b981' },
  { key: 'solaris_gold', slug: 'solaris-gold', name: 'Solaris Gold', desc: 'Celestial warmth with golden amber and solar radiance', border: '#f59e0b' },
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
  const themeContext = useContext(ThemeContext);
  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isEquippingKey, setIsEquippingKey] = useState<string | null>(null);

  // Identity editing state
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state when user object loads or updates
  useEffect(() => {
    if (user?.displayName && !displayName) {
      setDisplayName(user.displayName);
    }
    if (user?.avatarUrl !== undefined) {
      setAvatarPreview(user.avatarUrl);
    }
  }, [user]);

  const handleSelectTheme = async (themeDef: typeof PREGIVEN_HUD_THEMES[0]) => {
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

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <SettingsIcon size={22} color="#38bdf8" />
        </div>
        <div>
          <h1 style={{ fontSize: 'clamp(1.35rem, 4vw, 1.75rem)', margin: 0 }}>Citadel Settings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.2rem 0 0' }}>
            Configure your adventurer profile, avatar, cosmetics, and session preferences.
          </p>
        </div>
      </div>

      {/* Adventurer Identity & Profile Card */}
      <div className="rpg-card" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} color="#38bdf8" />
            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Adventurer Identity</h2>
          </div>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            color: '#38bdf8',
            fontWeight: 600,
          }}>
            Persistent Database Profile
          </span>
        </div>

        {/* Status Notification Toast */}
        {statusMessage && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              backgroundColor: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: statusMessage.type === 'success' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
              color: statusMessage.type === 'success' ? '#34d399' : '#fca5a5',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0 }} />
            ) : (
              <AlertCircle size={16} color="#fca5a5" style={{ flexShrink: 0 }} />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Avatar Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            padding: '1.25rem',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-surface-sunken)',
            border: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
          }}>
            {/* 128x128 Avatar Frame & Preview */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  border: '2px solid var(--border-focus)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(56, 189, 248, 0.25)',
                  position: 'relative',
                }}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile Avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <User size={48} color="#38bdf8" />
                )}

                {isCompressing && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem',
                  }}>
                    <Loader2 size={24} className="animate-spin" color="#38bdf8" />
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>128x128...</span>
                  </div>
                )}
              </div>

              {/* Quick camera trigger icon badge */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSaving || isCompressing}
                style={{
                  position: 'absolute',
                  bottom: '-4px',
                  right: '-4px',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary, #38bdf8)',
                  border: '2px solid var(--bg-surface)',
                  color: '#030712',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                }}
                title="Change picture"
              >
                <Camera size={14} />
              </button>
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

            {/* Avatar Actions & Guidance */}
            <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSaving || isCompressing}
                  className="rpg-btn"
                  style={{
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    borderRadius: '8px',
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    color: '#38bdf8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                  id="upload-pfp-btn"
                >
                  <Camera size={15} />
                  <span>Upload Picture</span>
                </button>

                <Link
                  to="/app/shop"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(168, 85, 247, 0.15)',
                    border: '1px solid rgba(168, 85, 247, 0.4)',
                    color: '#c084fc',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Sparkles size={14} />
                  <span>Forge AI Avatar</span>
                </Link>

                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={isSaving || isCompressing}
                    className="rpg-btn"
                    style={{
                      padding: '0.45rem 0.85rem',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      borderRadius: '8px',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#fca5a5',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                    id="remove-pfp-btn"
                  >
                    <Trash2 size={15} />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                Upload any picture (JPG, PNG, WEBP). It is automatically downscaled and cropped to an optimized <strong>128×128</strong> square format and saved permanently in the Citadel database.
              </p>
            </div>
          </div>

          {/* Profile Identity Form Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {/* Display Name Input */}
            <div>
              <label htmlFor="settings-display-name" className="rpg-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Display Name</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {displayName.length}/50
                </span>
              </label>
              <input
                id="settings-display-name"
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Enter hero name..."
                maxLength={50}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-surface-sunken)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color var(--duration-fast) ease',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--border-focus)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
              />
            </div>

            {/* Account Email (Read-Only) */}
            <div>
              <span className="rpg-label">Account Email</span>
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-surface-sunken)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.92rem',
                }}
              >
                {user?.email || 'user@example.com'}
              </div>
            </div>

            {/* Hero Title */}
            <div>
              <span className="rpg-label">Hero Title / Bestowed Honor</span>
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: (user?.title || character?.title) ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-surface-sunken)',
                  border: (user?.title || character?.title) ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: (user?.title || character?.title) ? '#fbbf24' : 'var(--text-secondary)',
                  fontWeight: (user?.title || character?.title) ? 700 : 500,
                  fontSize: '0.92rem',
                }}
              >
                <Award size={16} color={(user?.title || character?.title) ? '#fbbf24' : '#64748b'} />
                <span>{user?.title || character?.title || 'Novice Adventurer'}</span>
              </div>
            </div>

            {/* Citadel Economy Stats */}
            <div>
              <span className="rpg-label">Citadel Economy & Progression</span>
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-surface-sunken)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#38bdf8', fontWeight: 700, fontSize: '0.88rem' }}>
                  <Zap size={14} color="#38bdf8" />
                  Level {character?.level || 1} ({character?.totalXp || 0} XP)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#fbbf24', fontWeight: 700, fontSize: '0.88rem' }}>
                  <Coins size={14} color="#fbbf24" />
                  {character?.gold ?? 0} Coins
                </span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="submit"
              disabled={isSaving || isCompressing || !hasUnsavedChanges}
              className="rpg-btn rpg-btn-primary"
              style={{
                padding: '0.7rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: (!hasUnsavedChanges && !isSaving) ? 0.6 : 1,
                cursor: (!hasUnsavedChanges && !isSaving) ? 'not-allowed' : 'pointer',
              }}
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Dynamic Theme Token Switcher */}
      <div className="rpg-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Palette size={18} color="#a855f7" />
            <h2 style={{ fontSize: '1.15rem', margin: 0 }}>HUD Theme Customizer</h2>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#34d399', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <Sparkles size={12} />
            PRE-GIVEN STARTER THEMES
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Personalize your Life RPG dashboard and workstation. These starter themes are permanently unlocked and ready to equip.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
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
                style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  backgroundColor: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface-sunken)',
                  border: isSelected ? `2px solid ${theme.border}` : '1px solid var(--border-subtle)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: isSelected ? `0 0 15px ${theme.border}35` : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isSelected ? '#ffffff' : 'var(--text-primary)' }}>
                    {theme.name}
                  </span>
                  {isSelected && <Check size={16} color={theme.border} />}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {theme.desc}
                </p>
                <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isSelected ? '#34d399' : 'var(--text-tertiary)', letterSpacing: '0.04em' }}>
                    {isSelected ? 'EQUIPPED' : 'READY TO EQUIP'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
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
              transition: 'opacity 0.2s ease',
            }}
          >
            <Palette size={15} />
            Explore All Themes in Citadel Theme Marketplace & Vault →
          </Link>
        </div>
      </div>

      {/* Session Termination Card */}
      <div className="rpg-card" style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Shield size={18} color="#ef4444" />
          <h2 style={{ fontSize: '1.15rem', color: '#fca5a5' }}>Session Management</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          End your active Citadel session. Your progression is safely stored in the PostgreSQL database.
        </p>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="rpg-btn rpg-btn-danger"
          style={{ padding: '0.65rem 1.25rem', minHeight: '44px' }}
        >
          <LogOut size={16} />
          <span>{isLoggingOut ? 'Invalidating Session...' : 'Sign Out of Life RPG'}</span>
        </button>
      </div>
    </div>
  );
};
