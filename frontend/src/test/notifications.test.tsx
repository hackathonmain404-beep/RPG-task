import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HeaderHUD } from '../components/layout/HeaderHUD';
import { NotificationProvider } from '../context/NotificationContext';
import { FeedbackProvider } from '../context/FeedbackContext';
import { AuthContext } from '../context/authContextDef';
import type { AuthContextType } from '../context/authContextDef';
import { feedbackApi } from '../services/api/feedback';

const createMockAuthContext = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
  user: { id: 'usr_notif_1', email: 'samurai@citadel.com', displayName: 'Samurai' },
  character: { level: 3, totalXp: 950, gold: 120, streakCurrent: 4, streakBest: 9 },
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

const mockFeedbacks = [
  {
    id: 'fb_1',
    userId: 'usr_notif_1',
    type: 'BUG_REPORT' as const,
    message: 'The shop inventory does not refresh after buying armor.',
    status: 'REVIEWED',
    adminReply: 'We patched the inventory cache! Please refresh and check your armory.',
    repliedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 'fb_2',
    userId: 'usr_notif_1',
    type: 'FEATURE_REQUEST' as const,
    message: 'Can we have neon glow weapons in the market?',
    status: 'RESOLVED',
    adminReply: 'Neon Outpost katana and glow weapons are now live in the Citadel Armory!',
    repliedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'fb_3',
    userId: 'usr_notif_1',
    type: 'GENERAL' as const,
    message: 'Loving the Citadel theme!',
    status: 'PENDING',
    adminReply: null,
    repliedAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
];

const renderHeaderWithProviders = (mockAuth = createMockAuthContext()) => {
  return render(
    <AuthContext.Provider value={mockAuth}>
      <FeedbackProvider>
        <NotificationProvider>
          <BrowserRouter>
            <HeaderHUD />
          </BrowserRouter>
        </NotificationProvider>
      </FeedbackProvider>
    </AuthContext.Provider>
  );
};

describe('Citadel Notification Bell & Feedback Replies System', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    vi.spyOn(feedbackApi, 'getMyFeedback').mockResolvedValue({
      feedbacks: mockFeedbacks as any,
    });
  });

  it('renders Notification Bell in HeaderHUD immediately to the left of Feedback button', async () => {
    renderHeaderWithProviders();

    const notifBtn = screen.getByRole('button', { name: /Notifications/i });
    const feedbackBtn = screen.getByRole('button', { name: /Send Feedback/i });

    expect(notifBtn).toBeInTheDocument();
    expect(feedbackBtn).toBeInTheDocument();

    // Verify ordering in DOM (notifBtn appears before feedbackBtn)
    expect(notifBtn.compareDocumentPosition(feedbackBtn)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('displays unread badge counter for feedback with admin replies', async () => {
    renderHeaderWithProviders();

    await waitFor(() => {
      // fb_1 and fb_2 have admin replies, fb_3 does not
      const notifBtn = screen.getByRole('button', { name: /Notifications \(2 unread\)/i });
      expect(notifBtn).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('opens notifications dropdown on bell click and displays Council replies', async () => {
    renderHeaderWithProviders();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Notifications/i })).toBeInTheDocument();
    });

    const notifBtn = screen.getByRole('button', { name: /Notifications/i });
    fireEvent.click(notifBtn);

    // Dropdown dialog opens
    expect(screen.getByRole('dialog', { name: /Transmissions and Notifications/i })).toBeInTheDocument();
    expect(screen.getByText(/CITADEL TRANSMISSIONS/i)).toBeInTheDocument();

    // Displays Bug Report reply
    expect(screen.getByText(/Bug Report/i)).toBeInTheDocument();
    expect(screen.getByText(/We patched the inventory cache!/i)).toBeInTheDocument();

    // Displays Feature Idea reply
    expect(screen.getByText(/Feature Idea/i)).toBeInTheDocument();
    expect(screen.getByText(/Neon Outpost katana and glow weapons are now live/i)).toBeInTheDocument();
  });

  it('marks individual notification as read when clicking mark read', async () => {
    renderHeaderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    // Open dropdown
    fireEvent.click(screen.getByRole('button', { name: /Notifications/i }));

    // Click "Mark read" on the first item
    const markReadButtons = screen.getAllByRole('button', { name: /Mark read/i });
    expect(markReadButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(markReadButtons[0]);

    // Badge count updates to 1
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  it('marks all notifications as read when clicking Mark all read', async () => {
    renderHeaderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    // Open dropdown
    fireEvent.click(screen.getByRole('button', { name: /Notifications/i }));

    // Click "Mark all read"
    const markAllBtn = screen.getByRole('button', { name: /Mark all read/i });
    fireEvent.click(markAllBtn);

    // Badge disappears as unread count becomes 0
    await waitFor(() => {
      expect(screen.queryByText('2')).not.toBeInTheDocument();
      expect(screen.queryByText('1')).not.toBeInTheDocument();
    });
  });

  it('renders empty state when there are no admin replies yet', async () => {
    vi.spyOn(feedbackApi, 'getMyFeedback').mockResolvedValueOnce({
      feedbacks: [
        {
          id: 'fb_pending_only',
          userId: 'usr_notif_1',
          type: 'BUG_REPORT' as const,
          message: 'Still waiting for response',
          status: 'PENDING',
          adminReply: null,
          repliedAt: null,
          createdAt: new Date().toISOString(),
        },
      ] as any,
    });

    renderHeaderWithProviders();

    const notifBtn = screen.getByRole('button', { name: /Notifications/i });
    fireEvent.click(notifBtn);

    await waitFor(() => {
      expect(screen.getByText(/No Active Transmissions/i)).toBeInTheDocument();
      expect(screen.getByText(/When the Citadel council replies to your bugs/i)).toBeInTheDocument();
    });
  });
});
