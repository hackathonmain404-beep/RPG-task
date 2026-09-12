import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { INITIAL_THEMES, DEFAULT_THEME } from '../features/themes/types';
import { RARITY_CONFIG } from '../features/themes/rarity';
import { RarityBadge } from '../features/themes/components/RarityBadge';
import { ThemePreview } from '../features/themes/components/ThemePreview';
import { ThemeCard } from '../features/themes/components/ThemeCard';

describe('Theme Marketplace & Collection System', () => {
  describe('1. Theme Definitions & Specifications', () => {
    it('has all 5 required initial themes defined', () => {
      expect(INITIAL_THEMES).toHaveLength(5);
      const ids = INITIAL_THEMES.map(t => t.id);
      expect(ids).toContain('dark-matrix');
      expect(ids).toContain('cyberpunk');
      expect(ids).toContain('retro');
      expect(ids).toContain('lofi');
      expect(ids).toContain('cyberpunk-neon');
    });

    it('strictly separates Cyberpunk Theme (common) and Cyberpunk Neon (rare)', () => {
      const cyberpunkCommon = INITIAL_THEMES.find(t => t.id === 'cyberpunk');
      const cyberpunkNeon = INITIAL_THEMES.find(t => t.id === 'cyberpunk-neon');

      expect(cyberpunkCommon).toBeDefined();
      expect(cyberpunkNeon).toBeDefined();

      expect(cyberpunkCommon?.rarity).toBe('common');
      expect(cyberpunkCommon?.price).toBe(50);
      expect(cyberpunkCommon?.name).toBe('Cyberpunk Theme');

      expect(cyberpunkNeon?.rarity).toBe('rare');
      expect(cyberpunkNeon?.price).toBe(250);
      expect(cyberpunkNeon?.name).toBe('Cyberpunk Neon');

      // Verify colors are distinct
      expect(cyberpunkCommon?.colors.primary).toBe('#FF2BD6');
      expect(cyberpunkNeon?.colors.primary).toBe('#00D9FF');
    });

    it('has Dark Matrix Theme configured as the default fallback theme', () => {
      expect(DEFAULT_THEME.id).toBe('dark-matrix');
      expect(DEFAULT_THEME.price).toBe(50);
      expect(DEFAULT_THEME.rarity).toBe('common');
      expect(DEFAULT_THEME.colors.primary).toBe('#00FF9C');
    });
  });

  describe('2. Rarity System Separation', () => {
    it('provides the exact rarity colors specified in the prompt', () => {
      expect(RARITY_CONFIG.common.text).toBe('#9CA3AF');
      expect(RARITY_CONFIG.common.border).toBe('#4B5563');

      expect(RARITY_CONFIG.uncommon.text).toBe('#10B981');
      expect(RARITY_CONFIG.uncommon.border).toBe('#059669');

      expect(RARITY_CONFIG.rare.text).toBe('#00BFFF');
      expect(RARITY_CONFIG.rare.border).toBe('#0088CC');

      expect(RARITY_CONFIG.epic.text).toBe('#A855F7');
      expect(RARITY_CONFIG.epic.border).toBe('#7E22CE');

      expect(RARITY_CONFIG.legendary.text).toBe('#F59E0B');
      expect(RARITY_CONFIG.legendary.border).toBe('#D97706');
    });

    it('renders RarityBadge with designated styling', () => {
      const { container } = render(<RarityBadge rarity="rare" />);
      const badge = container.querySelector('.theme-rarity-badge') as HTMLElement;
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('RARE');
      expect(badge.style.color).toBe('rgb(0, 191, 255)');
    });
  });

  describe('3. Dynamic Theme Preview', () => {
    it('derives all container styling dynamically from theme.colors', () => {
      const retroTheme = INITIAL_THEMES.find(t => t.id === 'retro')!;
      const { container } = render(<ThemePreview theme={retroTheme} />);
      const preview = container.querySelector('.theme-preview-container') as HTMLElement;

      expect(preview).toBeInTheDocument();
      expect(preview.style.backgroundColor).toBe('rgb(23, 19, 34)'); // #171322
      expect(preview.style.borderColor).toBe('rgb(81, 68, 102)'); // #514466
    });
  });

  describe('4. Reusable ThemeCard & Action States', () => {
    const testTheme = INITIAL_THEMES[0]; // Dark Matrix, 50 gold

    it('renders card title, category badge, and gold price', () => {
      render(
        <ThemeCard
          theme={testTheme}
          isOwned={false}
          isEquipped={false}
          playerGold={100}
          isAuthenticated={true}
          onAcquire={vi.fn()}
          onEquip={vi.fn()}
        />
      );

      expect(screen.getByText('Dark Matrix Theme')).toBeInTheDocument();
      expect(screen.getByText('THEME')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /acquire/i })).toBeInTheDocument();
    });

    it('disables Acquire button when user has insufficient gold', () => {
      render(
        <ThemeCard
          theme={testTheme}
          isOwned={false}
          isEquipped={false}
          playerGold={10} // 10 < 50
          isAuthenticated={true}
          onAcquire={vi.fn()}
          onEquip={vi.fn()}
        />
      );

      const btn = screen.getByRole('button', { name: /acquire/i });
      expect(btn).toBeDisabled();
      expect(btn).toHaveClass('insufficient-gold');
    });

    it('renders "Equip" button when theme is owned but not equipped', () => {
      render(
        <ThemeCard
          theme={testTheme}
          isOwned={true}
          isEquipped={false}
          playerGold={100}
          isAuthenticated={true}
          onAcquire={vi.fn()}
          onEquip={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: /equip/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /acquire/i })).toBeNull();
    });

    it('renders disabled "Equipped" button when theme is active', () => {
      render(
        <ThemeCard
          theme={testTheme}
          isOwned={true}
          isEquipped={true}
          playerGold={100}
          isAuthenticated={true}
          onAcquire={vi.fn()}
          onEquip={vi.fn()}
        />
      );

      const btn = screen.getByRole('button', { name: /equipped/i });
      expect(btn).toBeInTheDocument();
      expect(btn).toBeDisabled();
    });

    it('fires onAcquire when clicking Acquire with sufficient funds', async () => {
      const handleAcquire = vi.fn().mockResolvedValue(undefined);
      render(
        <ThemeCard
          theme={testTheme}
          isOwned={false}
          isEquipped={false}
          playerGold={100}
          isAuthenticated={true}
          onAcquire={handleAcquire}
          onEquip={vi.fn()}
        />
      );

      const btn = screen.getByRole('button', { name: /acquire/i });
      await act(async () => {
        fireEvent.click(btn);
      });
      expect(handleAcquire).toHaveBeenCalledWith(testTheme);
    });
  });
});
