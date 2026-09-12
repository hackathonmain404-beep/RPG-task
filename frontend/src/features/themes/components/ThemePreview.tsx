import React from 'react';
import type { Theme } from '../types';

interface ThemePreviewProps {
  theme: Theme;
  size?: 'normal' | 'compact' | 'large';
  className?: string;
}

export const ThemePreview: React.FC<ThemePreviewProps> = ({ theme, size = 'normal', className = '' }) => {
  const { colors } = theme;

  return (
    <div
      className={`theme-preview-container size-${size} ${className}`}
      style={{
        backgroundColor: colors.background,
        borderColor: colors.border,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: '10px',
        padding: '0.85rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `inset 0 0 20px rgba(0, 0, 0, 0.5), 0 0 16px ${colors.primary}15`,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        height: size === 'large' ? '200px' : size === 'compact' ? '120px' : '150px',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Mini App Window Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${colors.border}`,
          paddingBottom: '0.4rem',
        }}
      >
        <div style={{ display: 'flex', gap: '4px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: colors.secondary }} />
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: colors.primary }} />
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: colors.border }} />
        </div>
        <div
          style={{
            fontSize: '0.65rem',
            fontFamily: 'monospace',
            fontWeight: 700,
            color: colors.primary,
            letterSpacing: '0.05em',
          }}
        >
          {theme.slug.toUpperCase()}
        </div>
      </div>

      {/* Mini App Mockup Card Surface */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: '1px',
          borderStyle: 'solid',
          borderRadius: '6px',
          padding: '0.55rem',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '45px',
            height: '45px',
            background: `radial-gradient(circle, ${colors.primary}33 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        {/* Text lines */}
        <div>
          <div
            style={{
              height: '6px',
              width: '45%',
              backgroundColor: colors.text,
              borderRadius: '3px',
              marginBottom: '4px',
            }}
          />
          <div
            style={{
              height: '4px',
              width: '75%',
              backgroundColor: colors.textMuted,
              borderRadius: '2px',
            }}
          />
        </div>

        {/* Mock RPG Action Bar / Swatches */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem' }}>
          {/* Progress bar */}
          <div
            style={{
              height: '5px',
              width: '55%',
              backgroundColor: colors.surfaceHover,
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: '70%',
                background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
              }}
            />
          </div>

          {/* Mini Action Button */}
          <div
            style={{
              backgroundColor: colors.primary,
              color: colors.background,
              fontSize: '0.58rem',
              fontWeight: 800,
              padding: '0.15rem 0.45rem',
              borderRadius: '4px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              boxShadow: `0 0 8px ${colors.primary}40`,
            }}
          >
            ACT
          </div>
        </div>
      </div>

      {/* Palette Swatch Bar */}
      <div
        style={{
          display: 'flex',
          gap: '5px',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: '0.15rem',
        }}
      >
        {[colors.background, colors.surface, colors.primary, colors.secondary, colors.border].map((hex, i) => (
          <span
            key={i}
            title={hex}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: hex,
              border: `1px solid ${i === 0 ? colors.border : 'rgba(255,255,255,0.2)'}`,
              display: 'inline-block',
            }}
          />
        ))}
      </div>
    </div>
  );
};
