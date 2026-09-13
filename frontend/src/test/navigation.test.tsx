import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
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
    expect(screen.getAllByText('ValiantCoder')[0]).toBeInTheDocument(); // Display name
    expect(screen.getByRole('button', { name: /Sign out of Achiever/i })).toBeInTheDocument();
  });
});

describe('SettingsPage (Adventurer Identity & Account)', () => {
  it('renders user details, identity fields, and session management', () => {
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
    expect(screen.getByText('Adventurer Identity')).toBeInTheDocument();
    expect(screen.getByText('Session Management')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Out of Life RPG/i })).toBeInTheDocument();

    // Verify HUD Theme Customizer is completely removed
    expect(screen.queryByText('HUD Theme Customizer')).not.toBeInTheDocument();
    expect(screen.queryByText('PRE-GIVEN STARTER THEMES')).not.toBeInTheDocument();
    expect(screen.queryByText('Dark Citadel')).not.toBeInTheDocument();
  });
});
