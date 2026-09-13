import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import type { Task } from '../../../types/contract';

interface VibeScoreCardProps {
  tasks?: Task[];
}

export const VibeScoreCard: React.FC<VibeScoreCardProps> = ({ tasks = [] }) => {
  // Compute score strictly from actual user quest data:
  // Baseline: 0 for new adventurers (starts empty)
  // +10 for on-time finishes
  // -5 for missed deadlines
  const { score, onTimeCount, missedCount } = useMemo(() => {
    const now = new Date();
    let onTime = 0;
    let missed = 0;

    // Helper to get end-of-day deadline timestamp
    const getDueDeadline = (dueStr: string): number => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dueStr)) {
        const [y, m, d] = dueStr.split('-').map(Number);
        return Date.UTC(y, m - 1, d, 23, 59, 59, 999);
      }
      return new Date(dueStr).getTime();
    };

    for (const t of tasks) {
      if (t.completed) {
        if (!t.dueDate || !t.completedAt) {
          onTime += 1;
        } else {
          const compTime = new Date(t.completedAt).getTime();
          const dueTime = getDueDeadline(t.dueDate);
          if (compTime <= dueTime) {
            onTime += 1;
          } else {
            // Completed but late
            onTime += 0.5;
          }
        }
      } else if (t.dueDate) {
        const dueTime = getDueDeadline(t.dueDate);
        if (dueTime < now.getTime()) {
          missed += 1;
        }
      }
    }

    const calculated = Math.max(0, Math.round((onTime * 10) - (missed * 5)));
    return {
      score: calculated,
      onTimeCount: Math.round(onTime),
      missedCount: missed,
    };
  }, [tasks]);

  // Circular ring settings
  const ringSize = 78;
  const strokeWidth = 7;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Ring fills based on score relative to 100 target (0 when 0, 10% when 10, etc.)
  const fillPercent = Math.min(1, Math.max(0, score / 100));
  const strokeDashoffset = circumference * (1 - fillPercent);

  return (
    <div className="analytics-card card-analytics-vibe anim-entrance-7" style={{ display: 'flex', alignItems: 'center' }}>
      <div className="vibe-card-inner">
        {/* Glowing Circular Ring with Score */}
        <div className="vibe-ring-container">
          <svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`}>
            <defs>
              <linearGradient id="vibeRingGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
              <filter id="vibeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#a855f7" floodOpacity="0.5" />
              </filter>
            </defs>

            {/* Inactive track */}
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.06)"
              strokeWidth={strokeWidth}
            />

            {/* Glowing Active Ring with load entrance animation */}
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
              className="vibe-ring-animated"
              style={{
                ['--target-vibe-offset' as string]: `${strokeDashoffset}`,
                transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </svg>

          {/* Large Numeric Score */}
          <span className="vibe-score-value mono-numbers">{score}</span>
        </div>

        {/* Supporting Text */}
        <div className="vibe-text-content">
          <div className="vibe-header">
            <Sparkles size={16} color="#fbbf24" />
            <span>Vibe Score</span>
          </div>
          <p className="vibe-subtext welcome-desc-animated">
            +10 for on-time finishes ({onTimeCount}), -5 for missed deadlines ({missedCount}).
            <br />
            Keep it up!
          </p>
        </div>
      </div>
    </div>
  );
};
