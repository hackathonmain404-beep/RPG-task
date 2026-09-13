import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HeaderHUD } from '../components/layout/HeaderHUD';
import { SettingsPage } from '../features/settings/SettingsPage';
import { AuthContext } from '../context/authContextDef';
import type { AuthContextType } from '../context/authContextDef';

const createMockAuthContext = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
  user: { id: 'usr_1', email: 'test@citadel.com', displayName: 'ValiantCoder' },
  character: { level: 5, totalXp: 1840, gold: 430, streakCurrent: 7, streakBest: 12 },
  isLoading: false,
  isGuest: false,
  serverReachable: true,
  xpProgress: null,
  recentActivity: [],
  lastAttributeChange: null,
  signInWithGoogle: vi.fn(),
  signInWithGithub: vi.fn(),
  signInAsGuest: vi.fn(),
  isAdmin: false,
  signInWithMagicLink: vi.fn(),
  verifyMagicLinkToken: vi.fn(),
  logout: vi.fn(),
  refreshSession: vi.fn(),
  refreshCharacter: vi.fn(),
  reconcileCompletion: vi.fn(),
  reconcilePurchase: vi.fn(),
  clearAttributeChangeNotice: vi.fn(),
  ...overrides,
});

describe('HeaderHUD', () => {
  it('renders Achiever brand, user display name, and sign out action', () => {
    const mockAuth = createMockAuthContext();
    render(
      <AuthContext.Provider value={mockAuth}>
        <BrowserRouter>
          <HeaderHUD />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Achiever')).toBeInTheDocument();
    expect(screen.getAllByText('ValiantCoder').length).toBeGreaterThan(0); // Display name
    expect(screen.getByRole('button', { name: /Sign out of Achiever/i })).toBeInTheDocument();
  });
});

describe('SettingsPage (Theme Switcher & Account)', () => {
  it('renders user details and theme switcher presets', () => {
    const mockAuth = createMockAuthContext();
    render(
      <AuthContext.Provider value={mockAuth}>
        <BrowserRouter>
          <SettingsPage />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByDisplayValue('ValiantCoder')).toBeInTheDocument();
    expect(screen.getByText('test@citadel.com')).toBeInTheDocument();
    expect(screen.getByText('Dark Citadel')).toBeInTheDocument();
    expect(screen.getByText('Neon Outpost')).toBeInTheDocument();
    expect(screen.getByText('Mystic Forest')).toBeInTheDocument();
    expect(screen.getByText('Solaris Gold')).toBeInTheDocument();

    // Click Neon Outpost theme
    const neonThemeBtn = screen.getByRole('button', { name: /Neon Outpost/i });
    fireEvent.click(neonThemeBtn);

    // Verify data-theme attribute set on document.documentElement
    expect(document.documentElement.getAttribute('data-theme')).toBe('neon_outpost');
  });
});
