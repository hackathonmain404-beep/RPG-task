import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { FeedbackProvider } from '../context/FeedbackContext';
import { HeaderHUD } from '../components/layout/HeaderHUD';
import { AppShell } from '../components/layout/AppShell';
import { FeedbackModal } from '../components/common/FeedbackModal';
import { feedbackApi } from '../services/api/feedback';
import { AuthContext } from '../context/authContextDef';
import type { AuthContextType } from '../context/authContextDef';

const createMockAuthContext = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
  user: { id: 'usr_feedback_1', email: 'adventurer@citadel.com', displayName: 'HeroAdventurer' },
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

const renderWithProviders = (ui: React.ReactElement, mockAuth = createMockAuthContext()) => {
  return render(
    <AuthContext.Provider value={mockAuth}>
      <FeedbackProvider>
        <BrowserRouter>
          {ui}
        </BrowserRouter>
      </FeedbackProvider>
    </AuthContext.Provider>
  );
};

describe('Global Feedback System', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders Feedback button in HeaderHUD immediately to the left of player profile', () => {
    renderWithProviders(<HeaderHUD />);

    const feedbackBtn = screen.getByRole('button', { name: /Send Feedback/i });
    expect(feedbackBtn).toBeInTheDocument();
    expect(feedbackBtn).toHaveTextContent('Feedback');
    expect(screen.getAllByText('HeroAdventurer')[0]).toBeInTheDocument();
  });

  it('renders Feedback action button in AppShell sidebar', () => {
    renderWithProviders(<AppShell />);

    const sidebarFeedbackBtn = screen.getByRole('button', { name: /Open Feedback Modal/i });
    expect(sidebarFeedbackBtn).toBeInTheDocument();
    expect(sidebarFeedbackBtn).toHaveTextContent('Feedback');
  });

  it('opens FeedbackModal when clicking Feedback button in AppShell', async () => {
    renderWithProviders(<AppShell />);

    // Modal is initially not visible
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Click sidebar feedback button
    const sidebarFeedbackBtn = screen.getByRole('button', { name: /Open Feedback Modal/i });
    fireEvent.click(sidebarFeedbackBtn);

    // Modal opens
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Send Feedback/i })).toBeInTheDocument();
    });
  });

  it('renders 3 feedback type cards and updates selection on click', () => {
    renderWithProviders(
      <FeedbackModal isOpen={true} onClose={vi.fn()} appName="Task-Do" />
    );

    const bugCard = screen.getByRole('radio', { name: /Bug Report/i });
    const featureCard = screen.getByRole('radio', { name: /Feature Request/i });
    const generalCard = screen.getByRole('radio', { name: /General/i });

    expect(bugCard).toBeInTheDocument();
    expect(featureCard).toBeInTheDocument();
    expect(generalCard).toBeInTheDocument();

    // Default selection is Bug Report
    expect(bugCard).toHaveAttribute('aria-checked', 'true');
    expect(featureCard).toHaveAttribute('aria-checked', 'false');

    // Click Feature Request
    fireEvent.click(featureCard);
    expect(featureCard).toHaveAttribute('aria-checked', 'true');
    expect(bugCard).toHaveAttribute('aria-checked', 'false');

    // Click General
    fireEvent.click(generalCard);
    expect(generalCard).toHaveAttribute('aria-checked', 'true');
    expect(featureCard).toHaveAttribute('aria-checked', 'false');
  });

  it('updates character count live and enables Send button only with valid content', () => {
    renderWithProviders(
      <FeedbackModal isOpen={true} onClose={vi.fn()} appName="Task-Do" />
    );

    const sendBtn = screen.getByRole('button', { name: /Send Feedback/i });
    expect(sendBtn).toBeDisabled();
    expect(screen.getByText('0 chars')).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(/Describe the bug/i);
    fireEvent.change(textarea, { target: { value: 'Inventory weapon icon not rendering.' } });

    expect(screen.getByText('36 chars')).toBeInTheDocument();
    expect(sendBtn).not.toBeDisabled();
  });

  it('submits feedback to backend API and shows confirmation', async () => {
    const submitSpy = vi.spyOn(feedbackApi, 'submit').mockResolvedValueOnce({
      feedback: {
        id: 'fb_123',
        userId: 'usr_feedback_1',
        type: 'FEATURE_REQUEST',
        message: 'Add dark mode customization for party members.',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      },
    });

    const handleClose = vi.fn();
    renderWithProviders(
      <FeedbackModal isOpen={true} onClose={handleClose} appName="Task-Do" />
    );

    // Switch to Feature Request
    const featureCard = screen.getByRole('radio', { name: /Feature Request/i });
    fireEvent.click(featureCard);

    const textarea = screen.getByPlaceholderText(/Describe your idea/i);
    fireEvent.change(textarea, {
      target: { value: 'Add dark mode customization for party members.' },
    });

    const sendBtn = screen.getByRole('button', { name: /Send Feedback/i });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(submitSpy).toHaveBeenCalledWith({
        type: 'FEATURE_REQUEST',
        message: 'Add dark mode customization for party members.',
      });
      expect(screen.getByText(/Thank you! Your feedback has been received./i)).toBeInTheDocument();
    });
  });

  it('closes on Escape key press and Cancel button', () => {
    const handleClose = vi.fn();
    const { rerender } = renderWithProviders(
      <FeedbackModal isOpen={true} onClose={handleClose} />
    );

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Click Cancel
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);
    expect(handleClose).toHaveBeenCalledTimes(2);

    // When closed, nothing renders
    rerender(
      <AuthContext.Provider value={createMockAuthContext()}>
        <FeedbackProvider>
          <BrowserRouter>
            <FeedbackModal isOpen={false} onClose={handleClose} />
          </BrowserRouter>
        </FeedbackProvider>
      </AuthContext.Provider>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('allows viewing submissions history tab', async () => {
    vi.spyOn(feedbackApi, 'getMyFeedback').mockResolvedValueOnce({
      feedbacks: [
        {
          id: 'fb_hist_1',
          userId: 'usr_feedback_1',
          type: 'BUG_REPORT',
          message: 'XP bar does not animate immediately after quest completion.',
          status: 'RESOLVED',
          createdAt: new Date().toISOString(),
        },
      ],
    });

    renderWithProviders(
      <FeedbackModal isOpen={true} onClose={vi.fn()} />
    );

    const submissionsTabBtn = screen.getByRole('button', { name: /Submissions/i });
    fireEvent.click(submissionsTabBtn);

    await waitFor(() => {
      expect(screen.getByText(/XP bar does not animate immediately after quest completion./i)).toBeInTheDocument();
      expect(screen.getByText('RESOLVED')).toBeInTheDocument();
    });
  });
});
