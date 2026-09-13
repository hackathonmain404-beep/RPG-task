import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HeaderHUD } from '../components/layout/HeaderHUD';
import { AppShell } from '../components/layout/AppShell';
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

  it('renders hamburger menu and hides profile container on mobile via desktop-only-profile class', () => {
    const mockAuth = createMockAuthContext();
    const toggleSidebar = vi.fn();
    const { container } = render(
      <AuthContext.Provider value={mockAuth}>
        <BrowserRouter>
          <HeaderHUD onToggleSidebar={toggleSidebar} isSidebarOpen={false} />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    const hamburgerBtn = screen.getByRole('button', { name: /Toggle Navigation Sidebar|Open Navigation Menu/i });
    expect(hamburgerBtn).toBeInTheDocument();

    const profileContainer = container.querySelector('.hud-profile-container');
    expect(profileContainer).toHaveClass('desktop-only-profile');

    // Also renders the square Feedback action button tagged with desktop-only-action
    const feedbackBtn = screen.getByRole('button', { name: /Send Feedback/i });
    expect(feedbackBtn).toBeInTheDocument();
    expect(feedbackBtn).toHaveClass('desktop-only-action');

    // Verify desktop dropdown contains both Account Settings and Character Sheet
    expect(screen.getByRole('link', { name: /Account Settings/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Character Sheet/i })).toBeInTheDocument();
  });
});

describe('AppShell Mobile Drawer Consolidation', () => {
  it('opens unified mobile drawer when hamburger is clicked with profile, nav, and actions', () => {
    const mockAuth = createMockAuthContext();
    const { container } = render(
      <AuthContext.Provider value={mockAuth}>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    // Simulate mobile viewport (< 1024px)
    window.innerWidth = 390;

    // Click the hamburger button in header
    const hamburgerBtn = screen.getByRole('button', { name: /Toggle Navigation Sidebar|Open Navigation Menu/i });
    fireEvent.click(hamburgerBtn);

    const drawer = container.querySelector<HTMLElement>('.mobile-drawer-panel');
    expect(drawer).toBeInTheDocument();
    const inDrawer = within(drawer!);

    // Profile details in mobile drawer
    expect(inDrawer.getByText('ValiantCoder')).toBeInTheDocument();
    expect(inDrawer.getByText('test@citadel.com')).toBeInTheDocument();
    expect(inDrawer.getByText(/Level 5/)).toBeInTheDocument();
    expect(inDrawer.getByText(/430 Gold/)).toBeInTheDocument();

    // Citadel Navigation in mobile drawer
    expect(inDrawer.getByText('Citadel Navigation')).toBeInTheDocument();
    expect(inDrawer.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();
    expect(inDrawer.getByRole('link', { name: /Quests/i })).toBeInTheDocument();
    expect(inDrawer.getByRole('link', { name: /Character/i })).toBeInTheDocument();
    expect(inDrawer.getByRole('link', { name: /Shop/i })).toBeInTheDocument();
    expect(inDrawer.getByRole('link', { name: /Themes/i })).toBeInTheDocument();
    expect(inDrawer.getByRole('link', { name: /Settings/i })).toBeInTheDocument();

    // Account & Actions in mobile drawer
    expect(inDrawer.getByText('Account & Actions')).toBeInTheDocument();
    expect(inDrawer.getByRole('button', { name: /Open Feedback Modal/i })).toBeInTheDocument();
    expect(inDrawer.getByRole('button', { name: /Sign Out/i })).toBeInTheDocument();

    // Closes on Escape
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(container.querySelector('.mobile-drawer-panel')).not.toBeInTheDocument();
  });

  it('renders exactly 5 primary destinations in mobile bottom navigation bar', () => {
    const mockAuth = createMockAuthContext();
    const { container } = render(
      <AuthContext.Provider value={mockAuth}>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    const bottomNav = container.querySelector<HTMLElement>('.mobile-bottom-nav');
    expect(bottomNav).toBeInTheDocument();
    const inBottomNav = within(bottomNav!);

    expect(inBottomNav.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();
    expect(inBottomNav.getByRole('link', { name: /Quests/i })).toBeInTheDocument();
    expect(inBottomNav.getByRole('link', { name: /Character/i })).toBeInTheDocument();
    expect(inBottomNav.getByRole('link', { name: /Shop/i })).toBeInTheDocument();
    expect(inBottomNav.getByRole('link', { name: /Themes/i })).toBeInTheDocument();

    // Inventory and Settings are moved into hamburger menu to prevent dense clutter
    expect(inBottomNav.queryByRole('link', { name: /Inventory/i })).not.toBeInTheDocument();
    expect(inBottomNav.queryByRole('link', { name: /Settings/i })).not.toBeInTheDocument();
  });
});

describe('DashboardPage Mobile Layout Polish', () => {
  it('renders clean Welcome card, Player Level with settings action, and Experience card', async () => {
    const mockAuth = createMockAuthContext();
    const { DashboardPage } = await import('../features/dashboard/DashboardPage');
    const { QuestsContext } = await import('../context/questsContextDef');
    const mockQuests: any = {
      tasks: [],
      lastRewardNotice: null,
      clearRewardNotice: vi.fn(),
      levelUpEvent: null,
      clearLevelUpEvent: vi.fn(),
    };

    render(
      <AuthContext.Provider value={mockAuth}>
        <QuestsContext.Provider value={mockQuests}>
          <BrowserRouter>
            <DashboardPage />
          </BrowserRouter>
        </QuestsContext.Provider>
      </AuthContext.Provider>
    );

    expect(screen.getByText(/CITADEL • ACTIVE SESSION/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Welcome back, Achiever!/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Character Sheet/i })).toBeInTheDocument();
    expect(screen.getByText('Player Level')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /System Settings/i })).toBeInTheDocument();
    expect(screen.getByText('Experience')).toBeInTheDocument();
    expect(screen.getByText(/Your current experience/i)).toBeInTheDocument();
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
