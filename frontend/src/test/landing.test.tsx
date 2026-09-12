import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LandingPage } from '../features/landing/LandingPage';

describe('LandingPage (Public Marketing & Quest Simulator)', () => {
  it('renders the primary H1 headline and value proposition', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(
      screen.getByRole('heading', { level: 1, name: /Your Life is the Game/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/The Adventurer's Productivity Operating System/i)).toBeInTheDocument();
  }, 15000);

  it('renders primary call-to-action navigation elements', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getAllByRole('link', { name: /Log In/i })[0]).toBeInTheDocument();
  });

  it('displays the 5 canonical character disciplines', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: 'Intellect' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Strength' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Wisdom' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Charisma' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Vitality' })).toBeInTheDocument();
  });

  it('toggles FAQ accordion items', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // First question is open by default
    expect(screen.getByText(/(Achiever|Life RPG) is a full-stack gamified productivity platform/i)).toBeInTheDocument();

    // Click second question
    const secondQuestionBtn = screen.getByRole('button', { name: /How does the XP and Leveling system work\?/i });
    fireEvent.click(secondQuestionBtn);

    expect(screen.getByText(/Progression uses a non-linear mathematical curve/i)).toBeInTheDocument();
  });
});
