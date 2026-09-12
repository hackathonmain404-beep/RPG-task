import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Palette, Check, ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/useTheme';
import { ThemePreview } from './components/ThemePreview';
import { RarityBadge } from './components/RarityBadge';
import './theme-marketplace.css';

export const ThemeCollectionPage: React.FC = () => {
  const { themes, isOwned, isEquipped, equipTheme } = useTheme();

  const ownedThemes = useMemo(() => {
    return themes.filter(t => isOwned(t.slug) || isOwned(t.id));
  }, [themes, isOwned]);

  return (
    <div className="theme-marketplace-root">
      <header className="theme-market-header">
        <div className="theme-market-titles">
          <span className="theme-market-eyebrow">
            <Layers size={14} />
            PLAYER ARSENAL • THEMES
          </span>
          <h1 className="theme-market-title">Theme Collection</h1>
          <p className="theme-market-subtitle">
            Manage and equip atmospheric workstation themes from your personal vault.
          </p>
        </div>

        <div>
          <Link to="/app/themes" className="theme-btn theme-btn-equip" style={{ textDecoration: 'none' }}>
            <Palette size={15} />
            Browse Marketplace
          </Link>
        </div>
      </header>

      {ownedThemes.length === 0 ? (
        <div className="theme-empty-state">
          <Palette size={44} color="#64748b" />
          <h3 className="theme-empty-title">Your Theme Vault is Empty</h3>
          <p className="theme-empty-text">
            You have not acquired any themes yet. Visit the Citadel Theme Marketplace to unlock custom themes for your workstation.
          </p>
          <Link to="/app/themes" className="theme-btn theme-btn-acquire" style={{ textDecoration: 'none' }}>
            Explore Themes <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="theme-market-grid">
          {ownedThemes.map((theme, index) => {
            const equipped = isEquipped(theme.slug) || isEquipped(theme.id);

            return (
              <div
                key={theme.slug || theme.id}
                className={`theme-card armory-card-anim rarity-${theme.rarity} ${equipped ? 'theme-card-active' : ''}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="theme-card-visual-wrapper">
                  <ThemePreview theme={theme} />
                </div>

                <div className="theme-card-body">
                  <div className="theme-card-badges-row">
                    <RarityBadge rarity={theme.rarity} />
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: equipped ? '#34d399' : '#94a3b8',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {equipped ? 'EQUIPPED' : 'OWNED'}
                    </span>
                  </div>

                  <h3 className="theme-card-title">{theme.name}</h3>
                  <p className="theme-card-description">{theme.description}</p>

                  <div className="theme-card-footer">
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Status: {equipped ? 'Active' : 'In Vault'}</span>
                    <div>
                      {equipped ? (
                        <button type="button" className="theme-btn theme-btn-equipped" disabled>
                          <Check size={14} />
                          Equipped
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="theme-btn theme-btn-equip"
                          onClick={() => equipTheme(theme)}
                        >
                          Equip
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
