import { describe, it, expect } from 'vitest';
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
  });

  it('runs the interactive quest simulator dopamine loop', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Initial state: 340 XP and 120 Gold
    expect(screen.getByText('340 XP')).toBeInTheDocument();
    expect(screen.getByText('120 Gold')).toBeInTheDocument();

    // Click complete button on simulator
    const completeBtn = screen.getByRole('button', { name: /Complete Demo Quest/i });
    fireEvent.click(completeBtn);

    // State after click: 340 + 65 = 405 XP, 120 + 18 = 138 Gold
    expect(screen.getByText('405 XP')).toBeInTheDocument();
    expect(screen.getByText('138 Gold')).toBeInTheDocument();

    // Celebration message visible
    expect(screen.getByText(/Quest Claimed! \+65 XP and \+18 Gold added/i)).toBeInTheDocument();
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
    expect(screen.getByText(/Life RPG is a full-stack gamified productivity platform/i)).toBeInTheDocument();

    // Click second question
    const secondQuestionBtn = screen.getByRole('button', { name: /How does the XP and Leveling system work\?/i });
    fireEvent.click(secondQuestionBtn);

    expect(screen.getByText(/Progression uses a non-linear mathematical curve/i)).toBeInTheDocument();
  });
});
