import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ShopPage } from '../features/shop/ShopPage';
import { InventoryPage } from '../features/inventory/InventoryPage';
import { AuthContext } from '../context/authContextDef';
import { ShopContext } from '../context/shopContextDef';
import type { AuthContextType } from '../context/authContextDef';
import type { ShopContextType } from '../context/shopContextDef';
import type { ShopItem, InventoryItem, Character } from '../types/contract';

const mockShopItems: ShopItem[] = [
  {
    id: 'theme_neon',
    sku: 'THM-NEON-01',
    name: 'Neon Outpost Theme',
    description: 'Deep cyber-void interface with electric fuchsia and cyan accents.',
    itemType: 'theme',
    price: 250,
    rarity: 'epic',
    active: true,
  },
  {
    id: 'theme_mystic',
    sku: 'THM-MYST-01',
    name: 'Mystic Forest Theme',
    description: 'Dark emerald grove with ancient glowing runes and calm tranquility.',
    itemType: 'theme',
    price: 200,
    rarity: 'rare',
    active: true,
  },
  {
    id: 'frame_bastion',
    sku: 'FRM-BAST-01',
    name: 'Midnight Bastion Frame',
    description: 'Hardened obsidian armor border forged in the Citadel gates.',
    itemType: 'frame',
    price: 75,
    rarity: 'common',
    active: true,
  },
];

const mockInventory: InventoryItem[] = [
  {
    id: 'inv_1',
    shopItemId: 'frame_bastion',
    itemId: 'frame_bastion',
    purchasedAt: '2026-09-12T10:00:00Z',
    equipped: true,
    shopItem: mockShopItems[2],
  },
  {
    id: 'inv_2',
    shopItemId: 'theme_mystic',
    itemId: 'theme_mystic',
    purchasedAt: '2026-09-12T11:00:00Z',
    equipped: false,
    shopItem: mockShopItems[1],
  },
];

const mockCharacter: Character = {
  level: 5,
  totalXp: 2450,
  gold: 480,
  streakCurrent: 7,
  streakBest: 14,
};

const createMockAuthContext = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
  user: { id: 'usr_1', email: 'adventurer@citadel.com', displayName: 'ValiantCoder' },
  character: mockCharacter,
  isLoading: false,
  isGuest: false,
  serverReachable: true,
  xpProgress: null,
  recentActivity: [],
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

const createMockShopContext = (overrides: Partial<ShopContextType> = {}): ShopContextType => ({
  shopItems: mockShopItems,
  inventory: mockInventory,
  equippedTheme: 'default',
  isLoadingShop: false,
  isLoadingInventory: false,
  shopError: null,
  inventoryError: null,
  pendingPurchaseItemIds: new Set<string>(),
  pendingEquipItemIds: new Set<string>(),
  loadShop: vi.fn().mockResolvedValue(undefined),
  loadInventory: vi.fn().mockResolvedValue(undefined),
  purchaseItem: vi.fn().mockResolvedValue({
    purchase: { itemId: 'theme_neon', price: 250 },
    wallet: { gold: 230 },
    inventoryItem: { id: 'inv_new', itemId: 'theme_neon' },
  }),
  equipItem: vi.fn().mockResolvedValue({ success: true, equippedItemId: 'theme_neon' }),
  isOwned: (id: string) => id === 'frame_bastion' || id === 'theme_mystic',
  isEquipped: (id: string) => id === 'frame_bastion',
  ...overrides,
});

const renderShopPage = (
  shopOverrides: Partial<ShopContextType> = {},
  authOverrides: Partial<AuthContextType> = {}
) => {
  const mockShop = createMockShopContext(shopOverrides);
  const mockAuth = createMockAuthContext(authOverrides);

  const utils = render(
    <AuthContext.Provider value={mockAuth}>
      <ShopContext.Provider value={mockShop}>
        <BrowserRouter>
          <ShopPage />
        </BrowserRouter>
      </ShopContext.Provider>
    </AuthContext.Provider>
  );

  return { ...utils, mockShop, mockAuth };
};

const renderInventoryPage = (
  shopOverrides: Partial<ShopContextType> = {},
  authOverrides: Partial<AuthContextType> = {}
) => {
  const mockShop = createMockShopContext(shopOverrides);
  const mockAuth = createMockAuthContext(authOverrides);

  const utils = render(
    <AuthContext.Provider value={mockAuth}>
      <ShopContext.Provider value={mockShop}>
        <BrowserRouter>
          <InventoryPage />
        </BrowserRouter>
      </ShopContext.Provider>
    </AuthContext.Provider>
  );

  return { ...utils, mockShop, mockAuth };
};

describe('Phase 5 — Shop, Inventory & Rewards System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.removeAttribute('data-theme');
  });

  // 1. Shop loads
  it('1. renders the Citadel Armory header and catalog', () => {
    renderShopPage();
    expect(screen.getByRole('heading', { level: 1, name: /The Citadel Armory/i })).toBeInTheDocument();
    expect(screen.getByText(/Acquire cosmetic themes, avatar frames/i)).toBeInTheDocument();
  });

  // 2. Items display correctly
  it('2. displays shop items with name, description, rarity, and price', () => {
    renderShopPage();
    expect(screen.getByText('Neon Outpost Theme')).toBeInTheDocument();
    expect(screen.getByText(/Deep cyber-void interface/i)).toBeInTheDocument();
    expect(screen.getByText('250')).toBeInTheDocument();
    expect(screen.getByText('Epic')).toBeInTheDocument();

    expect(screen.getByText('Mystic Forest Theme')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('Rare')).toBeInTheDocument();
  });

  // 3. Gold displays correctly
  it('3. displays authoritative treasury Gold balance', () => {
    renderShopPage();
    expect(screen.getByText('480')).toBeInTheDocument();
    expect(screen.getByText(/Treasury Balance/i)).toBeInTheDocument();
  });

  // 4. Purchase confirmation modal opens on click
  it('4. opens purchase confirmation modal when Acquire button is clicked', () => {
    renderShopPage();
    const acquireBtn = screen.getByRole('button', { name: /Purchase Neon Outpost Theme for 250 Gold/i });
    fireEvent.click(acquireBtn);

    expect(screen.getByRole('dialog', { name: /Confirm Citadel Acquisition/i })).toBeInTheDocument();
    expect(screen.getByText(/Acquiring this item will dispatch an authoritative purchase request/i)).toBeInTheDocument();
  });

  // 5. Purchase succeeds with server confirmation
  it('5. calls purchaseItem when purchase is confirmed in modal', async () => {
    const { mockShop } = renderShopPage();
    const acquireBtn = screen.getByRole('button', { name: /Purchase Neon Outpost Theme for 250 Gold/i });
    fireEvent.click(acquireBtn);

    const confirmBtn = screen.getByRole('button', { name: /Confirm Purchase/i });
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    expect(mockShop.purchaseItem).toHaveBeenCalledWith('theme_neon');
  });

  // 6. Item shows owned status when owned
  it('6. displays Owned state for already owned items', () => {
    renderShopPage();
    expect(screen.getByText('Owned')).toBeInTheDocument();
  });

  // 7. Category filtering works in Shop
  it('7. filters items by category tab', () => {
    renderShopPage();
    const themesTab = screen.getByRole('button', { name: /^Themes$/i });
    fireEvent.click(themesTab);

    expect(screen.getByText('Neon Outpost Theme')).toBeInTheDocument();
    expect(screen.getByText('Mystic Forest Theme')).toBeInTheDocument();
    expect(screen.queryByText('Midnight Bastion Frame')).not.toBeInTheDocument();
  });

  // 8. Handles purchase error (e.g. 409 INSUFFICIENT_GOLD)
  it('8. displays error message in modal when purchase fails with insufficient gold', async () => {
    renderShopPage({
      purchaseItem: vi.fn().mockRejectedValue({
        code: 'INSUFFICIENT_GOLD',
        message: 'You need 40 more Gold.',
      }),
    });

    const acquireBtn = screen.getByRole('button', { name: /Purchase Neon Outpost Theme for 250 Gold/i });
    fireEvent.click(acquireBtn);

    const confirmBtn = screen.getByRole('button', { name: /Confirm Purchase/i });
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Insufficient Gold in Citadel Treasury/i)).toBeInTheDocument();
  });

  // 9. Keyboard Escape dismisses purchase modal
  it('9. closes purchase confirmation modal when Escape key is pressed', () => {
    renderShopPage();
    const acquireBtn = screen.getByRole('button', { name: /Purchase Neon Outpost Theme for 250 Gold/i });
    fireEvent.click(acquireBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  // 10. Inventory page loads with owned items
  it('10. renders Inventory page with owned items and active theme bar', () => {
    renderInventoryPage();
    expect(screen.getByRole('heading', { level: 1, name: /Adventurer Vault & Inventory/i })).toBeInTheDocument();
    expect(screen.getByText(/Equipped Theme/i)).toBeInTheDocument();
    expect(screen.getByText('Midnight Bastion Frame')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  // 11. Empty inventory state renders guidance
  it('11. renders empty state and CTA to Shop when inventory is empty', () => {
    renderInventoryPage({ inventory: [] });
    expect(screen.getByText('Your Inventory is Empty')).toBeInTheDocument();
    expect(screen.getByText(/Complete quests and spend your Gold in the Shop/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Visit Citadel Armory/i })).toBeInTheDocument();
  });

  // 12. Equip action calls equipItem on unequipped item
  it('12. calls equipItem when Equip button is clicked in Inventory', async () => {
    const unequippedInventory: InventoryItem[] = [
      {
        id: 'inv_theme',
        shopItemId: 'theme_neon',
        itemId: 'theme_neon',
        purchasedAt: '2026-09-12T11:00:00Z',
        equipped: false,
        shopItem: mockShopItems[0],
      },
    ];

    const { mockShop } = renderInventoryPage(
      {
        inventory: unequippedInventory,
        isEquipped: () => false,
      }
    );

    const equipBtn = screen.getByRole('button', { name: /Equip Neon Outpost Theme/i });
    await act(async () => {
      fireEvent.click(equipBtn);
    });

    expect(mockShop.equipItem).toHaveBeenCalledWith('theme_neon');
  });

  // 13. Category filtering in Inventory
  it('13. filters inventory items by category', () => {
    renderInventoryPage();
    const themesTab = screen.getByRole('button', { name: /^Themes$/i });
    fireEvent.click(themesTab);

    expect(screen.getByText('Mystic Forest Theme')).toBeInTheDocument();
    expect(screen.queryByText('Midnight Bastion Frame')).not.toBeInTheDocument();

    const badgesTab = screen.getByRole('button', { name: /^Badges$/i });
    fireEvent.click(badgesTab);
    expect(screen.getByText(/No owned items matching the "badge" category/i)).toBeInTheDocument();
  });

  // 14. Error handling in Shop catalog loading
  it('14. displays recoverable error notice when shop catalog fails to load', () => {
    renderShopPage({ shopError: 'Citadel database offline' });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Citadel database offline/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
  });

  // 15. Error handling in Inventory loading
  it('15. displays recoverable error notice when inventory fails to load', () => {
    renderInventoryPage({ inventoryError: 'Failed to retrieve vault records' });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Failed to retrieve vault records/i)).toBeInTheDocument();
  });

  // 16. Details Inspection Modal
  it('16. opens item details inspection modal on inspect button click', () => {
    renderShopPage();
    const inspectBtn = screen.getByRole('button', { name: /Inspect Neon Outpost Theme/i });
    fireEvent.click(inspectBtn);

    expect(screen.getByRole('dialog', { name: /Neon Outpost Theme/i })).toBeInTheDocument();
    expect(screen.getByText(/Requisition Archive Lore/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Close item details/i })).toBeInTheDocument();
  });

  // 17. Search filtering
  it('17. filters items by search keyword in the toolbar', () => {
    renderShopPage();
    const searchInput = screen.getByRole('textbox', { name: /Filter armory items by keyword/i });
    fireEvent.change(searchInput, { target: { value: 'Obsidian' } });

    expect(screen.getByText('Midnight Bastion Frame')).toBeInTheDocument();
    expect(screen.queryByText('Neon Outpost Theme')).not.toBeInTheDocument();
  });

  // 18. Sorting by price
  it('18. sorts items by price low-to-high', () => {
    renderShopPage();
    const sortSelect = screen.getByRole('combobox', { name: /Sort catalog items/i });
    fireEvent.change(sortSelect, { target: { value: 'price-asc' } });

    const prices = screen.getAllByText(/\d+/).filter(el => ['75', '200', '250'].includes(el.textContent || ''));
    expect(prices[0]).toHaveTextContent('75');
  });

  // 19. Empty search state provides view all CTA
  it('19. displays empty state with reset CTA when no items match search', () => {
    renderShopPage();
    const searchInput = screen.getByRole('textbox', { name: /Filter armory items by keyword/i });
    fireEvent.change(searchInput, { target: { value: 'NonExistentItemXYZ' } });

    expect(screen.getByText('Armory Empty')).toBeInTheDocument();
    expect(screen.getByText('Nothing is available in this category yet.')).toBeInTheDocument();
    const resetBtn = screen.getByRole('button', { name: /View All Requisitions/i });
    fireEvent.click(resetBtn);

    expect(screen.getByText('Neon Outpost Theme')).toBeInTheDocument();
  });
});

