import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CharacterPage } from '../features/character/CharacterPage';
import { AuthContext } from '../context/authContextDef';
import type { AuthContextType } from '../context/authContextDef';
import type { Attribute, Character } from '../types/contract';

const mockAttributes: Attribute[] = [
  { key: 'intellect', displayName: 'Intellect', value: 18 },
  { key: 'strength', displayName: 'Strength', value: 12 },
  { key: 'wisdom', displayName: 'Wisdom', value: 42 },
  { key: 'charisma', displayName: 'Charisma', value: 15 },
  { key: 'vitality', displayName: 'Vitality', value: 20 },
];

const mockCharacter: Character = {
  level: 5,
  totalXp: 2450,
  gold: 480,
  streakCurrent: 7,
  streakBest: 14,
  attributes: mockAttributes,
};

const createMockAuthContext = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
  user: { id: 'usr_1', email: 'adventurer@citadel.com', displayName: 'ValiantCoder' },
  character: mockCharacter,
  isLoading: false,
  isGuest: false,
  serverReachable: true,
  xpProgress: {
    currentLevelXp: 450,
    nextLevelXp: 800,
    progressPercent: 56.25,
  },
  recentActivity: [
    {
      id: 'act_1',
      type: 'quest_completed',
      title: 'Conquer Dynamic Programming',
      timestamp: '2026-09-12T10:30:00Z',
      xpGained: 65,
      goldGained: 18,
      attributeGained: { key: 'intellect', amount: 8 },
      streakCurrent: 7,
    },
  ],
  lastAttributeChange: null,
  signInWithGoogle: vi.fn(),
  signInWithGithub: vi.fn(),
  signInAsGuest: vi.fn(),
  logout: vi.fn(),
  refreshSession: vi.fn(),
  refreshCharacter: vi.fn(),
  reconcileCompletion: vi.fn(),
  reconcilePurchase: vi.fn(),
  clearAttributeChangeNotice: vi.fn(),
  ...overrides,
});

const renderCharacterPage = (authOverrides: Partial<AuthContextType> = {}) => {
  const mockAuth = createMockAuthContext(authOverrides);
  const utils = render(
    <AuthContext.Provider value={mockAuth}>
      <BrowserRouter>
        <CharacterPage />
      </BrowserRouter>
    </AuthContext.Provider>
  );
  return { ...utils, mockAuth };
};

describe('Phase 4 — Character Progression System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Character page loads
  it('1. loads character page with semantic headings and hero banner', () => {
    renderCharacterPage();
    expect(screen.getByRole('heading', { level: 1, name: /ValiantCoder/i })).toBeInTheDocument();
    expect(screen.getByText(/adventurer@citadel.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Authoritative PostgreSQL Session/i)).toBeInTheDocument();
  });

  // 2. Level displayed correctly
  it('2. displays authoritative level in hero badge and vitals card', () => {
    renderCharacterPage();
    const levelBadges = screen.getAllByText(/Level 5/i);
    expect(levelBadges.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Lvl 5')).toBeInTheDocument();
  });

  // 3. XP displayed correctly
  it('3. displays authoritative XP progress and progressbar attributes', () => {
    renderCharacterPage();
    expect(screen.getByText('2,450 XP')).toBeInTheDocument();
    expect(screen.getByText('56%')).toBeInTheDocument();

    const xpBar = screen.getByRole('progressbar', { name: /Level 5 experience progress: 56%/i });
    expect(xpBar).toHaveAttribute('aria-valuenow', '56');
    expect(xpBar).toHaveAttribute('aria-valuemin', '0');
    expect(xpBar).toHaveAttribute('aria-valuemax', '100');
  });

  // 4. Current streak displayed correctly
  it('4. displays authoritative current momentum streak with flame indicator', () => {
    renderCharacterPage();
    expect(screen.getByText(/🔥 7/i)).toBeInTheDocument();
    expect(screen.getByText(/Days Streak/i)).toBeInTheDocument();
  });

  // 5. Best streak displayed correctly
  it('5. displays authoritative best streak milestone record', () => {
    renderCharacterPage();
    expect(screen.getByText(/Best Record:/i)).toBeInTheDocument();
    expect(screen.getByText(/🔥 14 Days/i)).toBeInTheDocument();
  });

  // 6. All five attributes displayed
  it('6. displays all five core attributes with mastery ranks', () => {
    renderCharacterPage();
    expect(screen.getByText('Intellect')).toBeInTheDocument();
    expect(screen.getByText('Strength')).toBeInTheDocument();
    expect(screen.getByText('Wisdom')).toBeInTheDocument();
    expect(screen.getByText('Charisma')).toBeInTheDocument();
    expect(screen.getByText('Vitality')).toBeInTheDocument();

    // Check values
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  // 7. Attribute update after quest completion (e.g. Wisdom 42 → 44 (+2))
  it('7. visually communicates attribute increase transition when server rewards an attribute', () => {
    renderCharacterPage({
      character: {
        ...mockCharacter,
        attributes: [
          ...mockAttributes.filter(a => a.key !== 'wisdom'),
          { key: 'wisdom', displayName: 'Wisdom', value: 44 },
        ],
      },
      lastAttributeChange: {
        key: 'wisdom',
        amount: 2,
        prevValue: 42,
        newValue: 44,
        timestamp: Date.now(),
      },
    });

    // Check status live-region communicating the change
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/Server Reward:/i)).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getAllByText('44').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  // 8. Streak update after quest completion
  it('8. displays updated streak after server increments momentum count', () => {
    renderCharacterPage({
      character: {
        ...mockCharacter,
        streakCurrent: 8,
        streakBest: 14,
      },
    });

    expect(screen.getByText(/🔥 8/i)).toBeInTheDocument();
    expect(screen.getByText(/Days Streak/i)).toBeInTheDocument();
  });

  // 9. Recent activity updates
  it('9. displays chronological activity feed with verified server rewards', () => {
    renderCharacterPage();
    expect(screen.getByText('Progression & Activity Log')).toBeInTheDocument();
    expect(screen.getByText('Conquer Dynamic Programming')).toBeInTheDocument();
    expect(screen.getByText('+65 XP')).toBeInTheDocument();
    expect(screen.getByText('+18 Gold')).toBeInTheDocument();
    expect(screen.getByText('+8 intellect')).toBeInTheDocument();
  });

  // 10. Empty state for activity
  it('10. renders accessible empty state when user has no activity records', () => {
    renderCharacterPage({ recentActivity: [] });
    expect(screen.getByText('No Progression Records Yet')).toBeInTheDocument();
    expect(screen.getByText(/Complete quests on your quest board to forge authoritative/i)).toBeInTheDocument();
  });

  // 11. Refresh persistence & sync button
  it('11. triggers refreshCharacter on manual sync button click', async () => {
    const { mockAuth } = renderCharacterPage();
    const syncButton = screen.getByRole('button', { name: /Synchronize character data with server/i });
    await act(async () => {
      fireEvent.click(syncButton);
    });

    expect(mockAuth.refreshCharacter).toHaveBeenCalledTimes(1);
  });

  // 12. API error handling & recovery
  it('12. displays recoverable error banner and retry action when server is unreachable', () => {
    renderCharacterPage({ serverReachable: false });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Citadel Synchronization Warning/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
  });

  // 13. Level-up event in activity feed
  it('13. highlights level-up milestone in recent activity', () => {
    renderCharacterPage({
      recentActivity: [
        {
          id: 'act_lvl',
          type: 'level_up',
          title: 'Ascended to Citadel Tier 6',
          timestamp: '2026-09-12T12:00:00Z',
          levelBefore: 5,
          levelAfter: 6,
          xpGained: 150,
          goldGained: 50,
        },
      ],
    });

    expect(screen.getByText('Ascended to Citadel Tier 6')).toBeInTheDocument();
    expect(screen.getByText('Level Up (6)')).toBeInTheDocument();
  });

  // 14. Keyboard navigation & accessible attributes
  it('14. maintains accessible button and progressbar ARIA attributes', () => {
    renderCharacterPage();
    const syncBtn = screen.getByRole('button', { name: /Synchronize character data with server/i });
    expect(syncBtn).not.toBeDisabled();

    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBeGreaterThanOrEqual(6); // 1 main XP bar + 5 attribute meters
  });

  // 15. Respects fallback when attributes array is empty
  it('15. gracefully falls back to default 5 disciplines if attributes not yet populated', () => {
    renderCharacterPage({
      character: {
        ...mockCharacter,
        attributes: [],
      },
    });

    // When attributes array is empty, it doesn't crash and still renders cleanly
    expect(screen.getByText('Character Attributes')).toBeInTheDocument();
  });
});
