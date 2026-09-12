import React from 'react';
import { Shield, Sparkles, Coins, Flame } from 'lucide-react';
import type { Character } from '../../../types/contract';
import type { XpProgress } from '../../../context/authContextDef';

interface PlayerStatsCardsProps {
  character?: Character | null;
  xpProgress?: XpProgress | null;
}

export const PlayerStatsCards: React.FC<PlayerStatsCardsProps> = ({ character, xpProgress }) => {
  const level = character?.level ?? 1;
  const totalXp = character?.totalXp ?? 0;
  const gold = character?.gold ?? 0;
  const streak = character?.streakCurrent ?? 0;
  const streakBest = character?.streakBest ?? streak;

  const currentLevelXp = xpProgress?.currentLevelXp ?? totalXp;
  const nextLevelXp = xpProgress?.nextLevelXp ?? (level * 250 + 500);
  const xpPercent = xpProgress?.progressPercent ?? Math.min(100, Math.round((currentLevelXp / Math.max(1, nextLevelXp)) * 100));
  const xpToNext = Math.max(0, nextLevelXp - currentLevelXp);

  return (
    <section className="player-stats-row" aria-label="Player Vital Stats">
      {/* Card 1: LEVEL */}
      <div className="player-stat-card level-card">
        <div className="stat-card-top">
          <span className="stat-card-label">LEVEL</span>
          <div className="stat-icon-wrapper level-icon">
            <Shield size={16} />
          </div>
        </div>
        <div className="stat-card-main">
          <span className="stat-card-number mono-numbers">{level}</span>
          <span className="stat-secondary-text">+{xpToNext > 0 ? xpToNext : 550} XP to next level</span>
        </div>
        <div className="rpg-progress-track stat-progress-track" role="progressbar" aria-valuenow={Math.round(xpPercent)} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="rpg-progress-fill stat-progress-fill level-fill"
            style={{ width: `${Math.max(4, Math.min(100, xpPercent))}%` }}
          />
        </div>
      </div>

      {/* Card 2: XP */}
      <div className="player-stat-card xp-card">
        <div className="stat-card-top">
          <span className="stat-card-label">XP</span>
          <div className="stat-icon-wrapper xp-icon">
            <Sparkles size={16} />
          </div>
        </div>
        <div className="stat-card-main">
          <div className="stat-dual-numbers">
            <span className="stat-card-number mono-numbers">{currentLevelXp.toLocaleString()}</span>
            <span className="stat-number-divider">/</span>
            <span className="stat-number-cap mono-numbers">{nextLevelXp.toLocaleString()}</span>
          </div>
          <span className="stat-secondary-text">Authoritative XP</span>
        </div>
        <div className="rpg-progress-track stat-progress-track" role="progressbar" aria-valuenow={Math.round(xpPercent)} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="rpg-progress-fill stat-progress-fill xp-fill"
            style={{ width: `${Math.max(4, Math.min(100, xpPercent))}%` }}
          />
        </div>
      </div>

      {/* Card 3: GOLD */}
      <div className="player-stat-card gold-card">
        <div className="stat-card-top">
          <span className="stat-card-label">GOLD</span>
          <div className="stat-icon-wrapper gold-icon">
            <Coins size={16} />
          </div>
        </div>
        <div className="stat-card-main">
          <span className="stat-card-number mono-numbers gold-number">{gold.toLocaleString()}</span>
          <span className="stat-secondary-text">Spendable in Armory</span>
        </div>
        <div className="stat-pill-indicator gold-pill">
          <span>Active Currency</span>
        </div>
      </div>

      {/* Card 4: STREAK */}
      <div className="player-stat-card streak-card">
        <div className="stat-card-top">
          <span className="stat-card-label">STREAK</span>
          <div className="stat-icon-wrapper streak-icon">
            <Flame size={16} />
          </div>
        </div>
        <div className="stat-card-main">
          <div className="streak-value-wrapper">
            <span className="streak-fire-emoji">🔥</span>
            <span className="stat-card-number mono-numbers">{streak}</span>
            <span className="stat-unit-text">Days</span>
          </div>
          <span className="stat-secondary-text">Best: {streakBest} days</span>
        </div>
        <div className="stat-pill-indicator streak-pill">
          <span>{streak >= 3 ? 'Unstoppable Momentum' : 'Daily Consistency'}</span>
        </div>
      </div>
    </section>
  );
};
