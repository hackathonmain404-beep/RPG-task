import React from 'react';
import { Link } from 'react-router-dom';
import { Sword, Flame, Clock, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { Task } from '../../../types/contract';

interface HeroCurrentAdventureProps {
  userDisplayName?: string;
  tasks?: Task[];
  streakDays?: number;
  onContinueQuest?: (task: Task) => void;
  onCreateQuest?: () => void;
}

export const HeroCurrentAdventure: React.FC<HeroCurrentAdventureProps> = ({
  userDisplayName = 'Adventurer',
  tasks = [],
  streakDays = 0,
  onCreateQuest,
}) => {
  // Find top priority active quest for Today's Main Quest
  const activeTasks = tasks.filter(t => !t.completed);
  
  // Sort by priority: epic > hard > medium > easy, or nearest due date
  const priorityOrder: Record<string, number> = { epic: 4, hard: 3, medium: 2, easy: 1 };
  const sortedTasks = [...activeTasks].sort((a, b) => {
    const pA = priorityOrder[a.difficulty?.toLowerCase()] || 2;
    const pB = priorityOrder[b.difficulty?.toLowerCase()] || 2;
    return pB - pA;
  });

  const mainQuest = sortedTasks[0] || null;

  // Fallback defaults if no tasks exist
  const questTitle = mainQuest ? mainQuest.title : 'Build your portfolio website';
  const questXp = mainQuest ? (mainQuest.xpReward || 100) : 100;
  const questProgress = mainQuest ? 65 : 72; // Representative progress
  const estTime = mainQuest?.difficulty === 'epic' ? '~60 min' : mainQuest?.difficulty === 'hard' ? '~45 min' : '~30 min';

  return (
    <div className="hero-command-card" role="region" aria-label="Current Adventure Hero">
      {/* Subtle futuristic background effects */}
      <div className="hero-grid-overlay" aria-hidden="true" />
      <div className="hero-glow-radial" aria-hidden="true" />
      <div className="hero-ambient-glyphs" aria-hidden="true">
        <span className="ambient-glyph glyph-1">✦</span>
        <span className="ambient-glyph glyph-2">◈</span>
        <span className="ambient-glyph glyph-3">⚔</span>
      </div>

      <div className="hero-content-wrapper">
        {/* Left / Header side: Welcome message */}
        <div className="hero-header-col">
          <div className="hero-badge">
            <Sparkles size={13} className="hero-badge-icon" />
            <span>COMMAND CITADEL ONLINE</span>
          </div>
          <h1 className="hero-title">
            Welcome back, {userDisplayName || 'Adventurer'}.
          </h1>
          <p className="hero-subtitle">
            Your next challenge is waiting. Convert real-world focus into unstoppable progression.
          </p>
        </div>

        {/* Right / Main Feature: TODAY'S MAIN QUEST */}
        <div className="hero-featured-quest">
          <div className="featured-quest-header">
            <div className="featured-quest-tag">
              <Sword size={14} className="accent-sword-icon" />
              <span>TODAY&apos;S MAIN QUEST</span>
            </div>
            {mainQuest && (
              <span className={`featured-diff-badge ${mainQuest.difficulty?.toLowerCase() || 'medium'}`}>
                {mainQuest.difficulty?.toUpperCase() || 'MEDIUM'}
              </span>
            )}
          </div>

          <h2 className="featured-quest-title">
            {questTitle}
          </h2>

          {/* Progress Bar */}
          <div className="featured-progress-block">
            <div className="featured-progress-labels">
              <span className="progress-label-text">Quest Progress</span>
              <span className="progress-percent-text mono-numbers">{questProgress}%</span>
            </div>
            <div className="rpg-progress-track featured-track" role="progressbar" aria-valuenow={questProgress} aria-valuemin={0} aria-valuemax={100}>
              <div 
                className="rpg-progress-fill featured-fill" 
                style={{ width: `${questProgress}%` }}
              />
            </div>
          </div>

          {/* Metadata Badges: XP, Streak, Estimated Time */}
          <div className="featured-meta-row">
            <span className="featured-meta-badge xp-badge">
              <Sparkles size={13} />
              +{questXp} XP
            </span>
            <span className="featured-meta-badge streak-badge">
              <Flame size={13} />
              {streakDays > 0 ? `${streakDays} Day Streak` : '3 Day Streak'}
            </span>
            <span className="featured-meta-badge time-badge">
              <Clock size={13} />
              {estTime}
            </span>
          </div>

          {/* Dominant Primary CTA */}
          <div className="featured-cta-row">
            {mainQuest ? (
              <Link 
                to="/app/quests"
                className="hero-primary-cta"
                id="hero-continue-quest-cta"
              >
                <span>Continue Quest</span>
                <ArrowRight size={18} className="cta-arrow" />
              </Link>
            ) : (
              <button 
                type="button"
                onClick={onCreateQuest}
                className="hero-primary-cta"
                id="hero-create-first-quest-cta"
              >
                <span>Create Your First Quest</span>
                <ArrowRight size={18} className="cta-arrow" />
              </button>
            )}

            <Link 
              to="/app/quests"
              className="hero-secondary-link"
            >
              <CheckCircle2 size={15} />
              <span>All Quests ({activeTasks.length})</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
