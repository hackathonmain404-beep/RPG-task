import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from '../features/auth/LoginPage';
import { AdminRoute } from '../features/admin/AdminRoute';
import { AdminPanelPage } from '../features/admin/AdminPanelPage';
import { AuthContext } from '../context/authContextDef';
import type { AuthContextType } from '../context/authContextDef';

const createMockAuthContext = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
  user: null,
  character: null,
  isLoading: false,
  isGuest: false,
  isAdmin: false,
  serverReachable: true,
  xpProgress: null,
  recentActivity: [],
  lastAttributeChange: null,
  signInWithGoogle: vi.fn(),
  signInWithGithub: vi.fn(),
  signInWithMagicLink: vi.fn().mockResolvedValue({
    success: true,
    message: 'Magic link dispatched',
    email: 'user@example.com',
    isAdmin: false,
    verificationToken: 'test_token_123',
  }),
  verifyMagicLinkToken: vi.fn().mockResolvedValue({
    token: 'jwt_mock_token',
    user: { id: 'usr_1', email: 'user@example.com', displayName: 'Hero', role: 'USER' },
    isAdmin: false,
    redirectTo: '/app/dashboard',
  }),
  signInAsGuest: vi.fn(),
  logout: vi.fn(),
  refreshSession: vi.fn(),
  refreshCharacter: vi.fn(),
  reconcileCompletion: vi.fn(),
  reconcilePurchase: vi.fn(),
  clearAttributeChangeNotice: vi.fn(),
  ...overrides,
});

describe('Magic Link Flow & Hidden Admin Control Panel Frontend Tests', () => {
  it('1. LoginPage renders Email input and primary Continue with Magic Link button', () => {
    const mockAuth = createMockAuthContext();
    render(
      <AuthContext.Provider value={mockAuth}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    const emailInput = screen.getByLabelText(/Email/i);
    expect(emailInput).toBeInTheDocument();

    const magicButton = screen.getByRole('button', { name: /Continue with Magic Link/i });
    expect(magicButton).toBeInTheDocument();
  });

  it('2. Submitting email calls signInWithMagicLink and displays Check your inbox state', async () => {
    const mockAuth = createMockAuthContext();
    render(
      <AuthContext.Provider value={mockAuth}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'hero@citadel.com' } });

    const magicButton = screen.getByRole('button', { name: /Continue with Magic Link/i });
    fireEvent.click(magicButton);

    await waitFor(() => {
      expect(mockAuth.signInWithMagicLink).toHaveBeenCalledWith('hero@citadel.com');
    });

    await waitFor(() => {
      expect(screen.getByText(/Check your inbox/i)).toBeInTheDocument();
      expect(screen.getByText(/We sent a magic sign-in link to hero@citadel.com/i)).toBeInTheDocument();
    });
  });

  it('3. AdminRoute strictly blocks regular users and redirects away from /admin', () => {
    const regularUserAuth = createMockAuthContext({
      user: { id: 'reg_user', email: 'normal@citadel.com', displayName: 'Hero', role: 'USER' },
      isAdmin: false,
    });

    render(
      <AuthContext.Provider value={regularUserAuth}>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <div data-testid="admin-secret-content">SECRET ADMIN CONTROLS</div>
                </AdminRoute>
              }
            />
            <Route path="/app/dashboard" element={<div data-testid="dashboard-fallback">Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.queryByTestId('admin-secret-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('dashboard-fallback')).toBeInTheDocument();
  });

  it('4. AdminRoute grants access to verified ADMIN role and renders the 4 core tabs', () => {
    const adminUserAuth = createMockAuthContext({
      user: { id: 'admin_root', email: 'Achiever_admin_4.com', displayName: 'Realm Commander', role: 'ADMIN' },
      isAdmin: true,
    });

    render(
      <AuthContext.Provider value={adminUserAuth}>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPanelPage />
                </AdminRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Verify all 4 tabs from Screenshots 2-4 are present
    expect(screen.getByText(/Users & Economy/i)).toBeInTheDocument();
    expect(screen.getByText(/Broadcasts & 2X Surge/i)).toBeInTheDocument();
    expect(screen.getByText(/Feedback Desk/i)).toBeInTheDocument();
    expect(screen.getByText(/Market Studio/i)).toBeInTheDocument();
  });

  it('5. Submitting Achiever_admin_4.com initiates instant admin authentication and navigates directly to /admin', async () => {
    const mockAuth = createMockAuthContext({
      signInWithMagicLink: vi.fn().mockResolvedValue({
        success: true,
        isAdmin: true,
        token: 'admin_jwt_mock_token',
        user: { id: 'admin_root', email: 'Achiever_admin_4.com', displayName: 'Admin', role: 'ADMIN' },
        redirectTo: '/admin',
      }),
    });

    render(
      <AuthContext.Provider value={mockAuth}>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<div data-testid="admin-panel-direct">ADMIN PANEL</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'Achiever_admin_4.com' } });

    const magicButton = screen.getByRole('button', { name: /Continue with Magic Link/i });
    fireEvent.click(magicButton);

    await waitFor(() => {
      expect(mockAuth.signInWithMagicLink).toHaveBeenCalledWith('Achiever_admin_4.com');
    });

    await waitFor(() => {
      expect(screen.getByTestId('admin-panel-direct')).toBeInTheDocument();
      expect(screen.queryByText(/Check your inbox/i)).not.toBeInTheDocument();
    });
  });

  it('6. Submitting email with existing Google account prompts user to use Continue with Google', async () => {
    const mockAuth = createMockAuthContext({
      signInWithMagicLink: vi.fn().mockResolvedValue({
        success: false,
        actionRequired: 'USE_GOOGLE',
        message: "This account was created with Google. Please use 'Continue with Google' to sign in.",
      }),
    });

    render(
      <AuthContext.Provider value={mockAuth}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'google_user@gmail.com' } });

    const magicButton = screen.getByRole('button', { name: /Continue with Magic Link/i });
    fireEvent.click(magicButton);

    await waitFor(() => {
      expect(mockAuth.signInWithMagicLink).toHaveBeenCalledWith('google_user@gmail.com');
    });

    await waitFor(() => {
      expect(screen.getByText(/This account was created with Google. Please use 'Continue with Google' to sign in./i)).toBeInTheDocument();
      expect(screen.queryByText(/Check your inbox/i)).not.toBeInTheDocument();
    });
  });
});
