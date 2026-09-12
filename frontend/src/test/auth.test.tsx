import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { AuthContext } from '../context/authContextDef';
import type { AuthContextType } from '../context/authContextDef';

const createMockAuthContext = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
  user: null,
  character: null,
  isLoading: false,
  serverReachable: true,
  xpProgress: null,
  recentActivity: [],
  lastAttributeChange: null,
  signInWithGoogle: vi.fn(),
  signInWithGithub: vi.fn(),
  logout: vi.fn(),
  refreshSession: vi.fn(),
  refreshCharacter: vi.fn(),
  reconcileCompletion: vi.fn(),
  reconcilePurchase: vi.fn(),
  clearAttributeChangeNotice: vi.fn(),
  ...overrides,
});

describe('LoginPage', () => {
  it('renders Google and GitHub sign-in buttons', () => {
    const mockAuth = createMockAuthContext();
    render(
      <AuthContext.Provider value={mockAuth}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByRole('button', { name: /Continue with Google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue with GitHub/i })).toBeInTheDocument();
  });

  it('renders the Enter the Citadel heading', () => {
    const mockAuth = createMockAuthContext();
    render(
      <AuthContext.Provider value={mockAuth}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByRole('heading', { name: /Enter the Citadel/i })).toBeInTheDocument();
  });

  it('does not render a password field', () => {
    const mockAuth = createMockAuthContext();
    render(
      <AuthContext.Provider value={mockAuth}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
  });
});

describe('RegisterPage', () => {
  it('renders starter archetypes and sign-in buttons', () => {
    const mockAuth = createMockAuthContext();
    render(
      <AuthContext.Provider value={mockAuth}>
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Scholar')).toBeInTheDocument();
    expect(screen.getByText('Warrior')).toBeInTheDocument();
    expect(screen.getByText('Sage')).toBeInTheDocument();
    expect(screen.getByText('Diplomat')).toBeInTheDocument();
    expect(screen.getByText('Guardian')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue with Google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue with GitHub/i })).toBeInTheDocument();
  });

  it('does not render a password field', () => {
    const mockAuth = createMockAuthContext();
    render(
      <AuthContext.Provider value={mockAuth}>
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
  });
});
