import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  refreshSession: vi.fn(),
  refreshCharacter: vi.fn(),
  reconcileCompletion: vi.fn(),
  reconcilePurchase: vi.fn(),
  clearAttributeChangeNotice: vi.fn(),
  ...overrides,
});

describe('LoginPage', () => {
  it('renders email and password inputs with accessible labels', () => {
    const mockAuth = createMockAuthContext();
    render(
      <AuthContext.Provider value={mockAuth}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByLabelText(/Adventurer Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Master Key \(Password\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enter Citadel/i })).toBeInTheDocument();
  });

  it('shows error message when submitted with empty fields', async () => {
    const mockAuth = createMockAuthContext();
    render(
      <AuthContext.Provider value={mockAuth}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    const submitBtn = screen.getByRole('button', { name: /Enter Citadel/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Please provide both your email address and password/i);
    });
  });
});

describe('RegisterPage', () => {
  it('renders display name, email, password, and starter archetypes', () => {
    const mockAuth = createMockAuthContext();
    render(
      <AuthContext.Provider value={mockAuth}>
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByLabelText(/Adventurer Title \/ Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Citadel Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Master Key \(Password\)/i)).toBeInTheDocument();
    expect(screen.getByText('Scholar')).toBeInTheDocument();
    expect(screen.getByText('Warrior')).toBeInTheDocument();
    expect(screen.getByText('Sage')).toBeInTheDocument();
    expect(screen.getByText('Diplomat')).toBeInTheDocument();
    expect(screen.getByText('Guardian')).toBeInTheDocument();
  });

  it('shows validation error when password is too short', async () => {
    const mockAuth = createMockAuthContext();
    render(
      <AuthContext.Provider value={mockAuth}>
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/Adventurer Title \/ Name/i), { target: { value: 'CodeKnight' } });
    fireEvent.change(screen.getByLabelText(/Citadel Email/i), { target: { value: 'knight@example.com' } });
    fireEvent.change(screen.getByLabelText(/Master Key \(Password\)/i), { target: { value: '123' } });

    const submitBtn = screen.getByRole('button', { name: /Forge Character & Embark/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Master key must be at least 6 characters in length/i);
    });
  });
});
