import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AiAvatarGeneratorModal } from '../features/shop/components/AiAvatarGeneratorModal';
import { ShopPage } from '../features/shop/ShopPage';
import { AuthContext } from '../context/authContextDef';
import { ShopContext } from '../context/shopContextDef';
import { avatarApi } from '../services/api/avatar';
import type { AuthContextType } from '../context/authContextDef';
import type { ShopContextType } from '../context/shopContextDef';
import type { ShopItem } from '../types/contract';

vi.mock('../services/api/avatar', () => ({
  avatarApi: {
    generateAvatar: vi.fn(),
  },
}));

const mockAvatars: ShopItem[] = [
  {
    id: 'avatar_phoenix',
    sku: 'avatar_phoenix',
    name: 'Phoenix Avatar',
    description: 'Rise from the ashes with this legendary avatar',
    itemType: 'COSMETIC',
    category: 'Avatar',
    price: 500,
    rarity: 'legendary',
    active: true,
  },
  {
    id: 'avatar_cyber_ninja',
    sku: 'avatar_cyber_ninja',
    name: 'Cyber Ninja',
    description: 'Stealth operative with an electric cyan visor',
    itemType: 'COSMETIC',
    category: 'Avatar',
    price: 400,
    rarity: 'epic',
    active: true,
  },
  {
    id: 'theme_cyberpunk',
    sku: 'theme_cyberpunk',
    name: 'Cyberpunk Theme',
    description: 'Neon-soaked dystopian interface',
    itemType: 'THEME',
    price: 250,
    rarity: 'rare',
    active: true,
  },
];

const createMockAuthContext = (overrides?: Partial<AuthContextType>): AuthContextType => ({
  user: {
    id: 'usr_test_123',
    email: 'test@citadel.com',
    displayName: 'ValiantCoder',
    role: 'USER',
    avatarUrl: null,
  },
  character: {
    level: 5,
    totalXp: 1200,
    gold: 500,
    streakCurrent: 4,
    streakBest: 10,
  },
  isLoading: false,
  isGuest: false,
  isAdmin: false,
  serverReachable: true,
  xpProgress: null,
  recentActivity: [],
  lastAttributeChange: null,
  signInWithGoogle: vi.fn(),
  signInWithGithub: vi.fn(),
  signInWithMagicLink: vi.fn(),
  verifyMagicLinkToken: vi.fn(),
  signInAsGuest: vi.fn(),
  logout: vi.fn(),
  refreshSession: vi.fn(),
  refreshCharacter: vi.fn(),
  reconcileCompletion: vi.fn(),
  reconcilePurchase: vi.fn(),
  clearAttributeChangeNotice: vi.fn(),
  setEquippedAvatar: vi.fn(),
  ...overrides,
});

const createMockShopContext = (overrides?: Partial<ShopContextType>): ShopContextType => ({
  shopItems: mockAvatars,
  inventory: [],
  equippedTheme: 'default',
  isLoadingShop: false,
  isLoadingInventory: false,
  shopError: null,
  inventoryError: null,
  pendingPurchaseItemIds: new Set(),
  pendingEquipItemIds: new Set(),
  loadShop: vi.fn(),
  loadInventory: vi.fn(),
  purchaseItem: vi.fn(),
  equipItem: vi.fn(),
  isOwned: vi.fn().mockReturnValue(false),
  isEquipped: vi.fn().mockReturnValue(false),
  ...overrides,
});

describe('Avatar System & Gemini Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders archetype options and custom prompt input in AiAvatarGeneratorModal', () => {
    const mockAuth = createMockAuthContext();
    const mockShop = createMockShopContext();

    render(
      <AuthContext.Provider value={mockAuth}>
        <ShopContext.Provider value={mockShop}>
          <AiAvatarGeneratorModal isOpen={true} onClose={vi.fn()} />
        </ShopContext.Provider>
      </AuthContext.Provider>
    );

    expect(screen.getByText(/Neural Forge: AI Avatar Synthesis/i)).toBeInTheDocument();
    expect(screen.getByText('Cyber Ninja')).toBeInTheDocument();
    expect(screen.getByText('Void Knight')).toBeInTheDocument();
    expect(screen.getByText('Arcane Archmage')).toBeInTheDocument();
    expect(screen.getByText('Phoenix Warrior')).toBeInTheDocument();
    expect(screen.getByText('Celestial Valkyrie')).toBeInTheDocument();
    expect(screen.getByText('Iron Sentinel')).toBeInTheDocument();

    const forgeButton = screen.getByRole('button', { name: /Forge Avatar/i });
    expect(forgeButton).toBeInTheDocument();
  });

  it('switches archetypes and updates prompt text', () => {
    const mockAuth = createMockAuthContext();
    const mockShop = createMockShopContext();

    render(
      <AuthContext.Provider value={mockAuth}>
        <ShopContext.Provider value={mockShop}>
          <AiAvatarGeneratorModal isOpen={true} onClose={vi.fn()} />
        </ShopContext.Provider>
      </AuthContext.Provider>
    );

    const voidKnightBtn = screen.getByText('Void Knight');
    fireEvent.click(voidKnightBtn);

    const textarea = screen.getByPlaceholderText(/Describe your character's gear/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain('obsidian plate');
  });

  it('submits avatar generation to backend API and updates equipped avatar on success', async () => {
    const mockAuth = createMockAuthContext();
    const mockShop = createMockShopContext();
    const mockOnSuccess = vi.fn();

    vi.mocked(avatarApi.generateAvatar).mockResolvedValueOnce({
      success: true,
      avatarUrl: '/assets/avatars/avatar_gen_test.png',
      avatar: {
        id: 'avatar_gen_test',
        sku: 'avatar_gen_test',
        name: 'Synthesized Void Knight',
        description: 'A dark cosmic warrior',
        itemType: 'COSMETIC',
        price: 100,
        rarity: 'legendary',
      },
    });

    render(
      <AuthContext.Provider value={mockAuth}>
        <ShopContext.Provider value={mockShop}>
          <AiAvatarGeneratorModal isOpen={true} onClose={vi.fn()} onSuccess={mockOnSuccess} />
        </ShopContext.Provider>
      </AuthContext.Provider>
    );

    const forgeButton = screen.getByRole('button', { name: /Forge Avatar/i });
    fireEvent.click(forgeButton);

    await waitFor(() => {
      expect(avatarApi.generateAvatar).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText(/LEGENDARY AVATAR SYNTHESIZED/i)).toBeInTheDocument();
      expect(mockAuth.setEquippedAvatar).toHaveBeenCalledWith('/assets/avatars/avatar_gen_test.png');
      expect(mockOnSuccess).toHaveBeenCalledWith('/assets/avatars/avatar_gen_test.png');
    });
  });

  it('handles generation errors and displays error banner', async () => {
    const mockAuth = createMockAuthContext();
    const mockShop = createMockShopContext();

    vi.mocked(avatarApi.generateAvatar).mockRejectedValueOnce(
      new Error('Neural Citadel quota exceeded. Please try again.')
    );

    render(
      <AuthContext.Provider value={mockAuth}>
        <ShopContext.Provider value={mockShop}>
          <AiAvatarGeneratorModal isOpen={true} onClose={vi.fn()} />
        </ShopContext.Provider>
      </AuthContext.Provider>
    );

    const forgeButton = screen.getByRole('button', { name: /Forge Avatar/i });
    fireEvent.click(forgeButton);

    await waitFor(() => {
      expect(screen.getByText(/Neural Citadel quota exceeded/i)).toBeInTheDocument();
    });
  });

  it('does not render Forge AI Avatar button in Citadel Armory ShopPage', () => {
    const mockAuth = createMockAuthContext();
    const mockShop = createMockShopContext();

    render(
      <AuthContext.Provider value={mockAuth}>
        <ShopContext.Provider value={mockShop}>
          <BrowserRouter>
            <ShopPage />
          </BrowserRouter>
        </ShopContext.Provider>
      </AuthContext.Provider>
    );

    const forgeTrigger = screen.queryByRole('button', { name: /Forge AI Avatar/i });
    expect(forgeTrigger).not.toBeInTheDocument();
  });

  it('filters shop items by Avatars category and displays avatar cards', () => {
    const mockAuth = createMockAuthContext();
    const mockShop = createMockShopContext();

    render(
      <AuthContext.Provider value={mockAuth}>
        <ShopContext.Provider value={mockShop}>
          <BrowserRouter>
            <ShopPage />
          </BrowserRouter>
        </ShopContext.Provider>
      </AuthContext.Provider>
    );

    const avatarCategoryTab = screen.getByRole('button', { name: 'Avatars' });
    expect(avatarCategoryTab).toBeInTheDocument();

    fireEvent.click(avatarCategoryTab);

    expect(screen.getByText('Phoenix Avatar')).toBeInTheDocument();
    expect(screen.getByText('Cyber Ninja')).toBeInTheDocument();
    expect(screen.queryByText('Cyberpunk Theme')).not.toBeInTheDocument();
  });
});
