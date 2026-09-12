import React, { useMemo } from 'react';
import { Sparkles, Flame } from 'lucide-react';
import type { Task } from '../../../types/contract';

interface VibeScoreCardProps {
  tasks?: Task[];
}

export const VibeScoreCard: React.FC<VibeScoreCardProps> = ({ tasks = [] }) => {
  // Compute score strictly from actual user quest data:
  // Baseline: 100
  // +10 for on-time finishes
  // -5 for missed deadlines
  const { score, onTimeCount, missedCount } = useMemo(() => {
    const now = new Date();
    let onTime = 0;
    let missed = 0;

    for (const t of tasks) {
      if (t.completed) {
        if (!t.dueDate || !t.completedAt) {
          onTime += 1;
        } else {
          const compDate = new Date(t.completedAt);
          const dueDate = new Date(t.dueDate);
          if (compDate <= dueDate) {
            onTime += 1;
          } else {
            // Completed but late
            onTime += 0.5;
          }
        }
      } else if (t.dueDate && new Date(t.dueDate) < now) {
        missed += 1;
      }
    }

    const calculated = Math.max(0, Math.round(100 + (onTime * 10) - (missed * 5)));
    return {
      score: calculated,
      onTimeCount: Math.floor(onTime),
      missedCount: missed,
    };
  }, [tasks]);

  // Game rank tier title based on score
  const rankTier = useMemo(() => {
    if (score >= 110) return 'LEGENDARY MOMENTUM';
    if (score >= 95) return 'LEGENDARY MOMENTUM';
    if (score >= 80) return 'HIGH VELOCITY';
    if (score >= 60) return 'STEADY CADENCE';
    return 'RECOVERING FOCUS';
  }, [score]);

  // Circular ring settings
  const ringSize = 88;
  const strokeWidth = 8;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Ring fills based on score relative to 200 target
  const fillPercent = Math.min(1, Math.max(0.1, score / 200));
  const strokeDashoffset = circumference * (1 - fillPercent);

  return (
    <div className="analytics-card vibe-score-command-card">
      <div className="vibe-card-inner">
        {/* Glowing Circular Ring with Score */}
        <div className="vibe-ring-container">
          <svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`}>
            <defs>
              <linearGradient id="vibeRingGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
              <filter id="vibeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#a855f7" floodOpacity="0.5" />
              </filter>
            </defs>

            {/* Inactive track */}
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={strokeWidth}
            />

            {/* Glowing Active Ring */}
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="transparent"
              stroke="url(#vibeRingGrad)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
              filter="url(#vibeGlow)"
            />
          </svg>

          {/* Large Numeric Score */}
          <span className="vibe-score-value mono-numbers">{score}</span>
        </div>

        {/* Supporting Game Rank & Explanations */}
        <div className="vibe-text-content">
          <div className="vibe-header">
            <Sparkles size={16} className="vibe-header-sparkle" />
            <span className="vibe-title-label">✨ VIBE SCORE</span>
            <span className="sr-only">Vibe Score</span>
          </div>

          <div className="vibe-rank-badge">
            <span>{rankTier}</span>
          </div>

          <p className="vibe-subtext">
            +10 for on-time finishes ({onTimeCount}), -5 for missed deadlines ({missedCount}).
          </p>

          <div className="vibe-momentum-status">
            <Flame size={14} className="vibe-flame-icon" />
            <span>You&apos;re on fire.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
