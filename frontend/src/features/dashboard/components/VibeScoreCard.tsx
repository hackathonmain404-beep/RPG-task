import React from 'react';
import { Sparkles } from 'lucide-react';
import type { Task } from '../../../types/contract';

interface VibeScoreCardProps {
  tasks?: Task[];
}

export const VibeScoreCard: React.FC<VibeScoreCardProps> = ({ tasks = [] }) => {
  const completedCount = tasks.filter(t => t.completed).length;
  // Calculate dynamic vibe score with 155 baseline
  const score = 155 + (completedCount * 10);

  // Circular ring settings
  const ringSize = 74;
  const strokeWidth = 7;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Fill 78% of the ring
  const strokeDashoffset = circumference * (1 - 0.78);

  return (
    <div className="analytics-card" style={{ display: 'flex', alignItems: 'center' }}>
      <div className="vibe-card-inner">
        {/* Glowing Circular Ring with Score */}
        <div className="vibe-ring-container">
          <svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`}>
            <defs>
              <linearGradient id="vibeRingGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="50%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
              <filter id="vibeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#a855f7" floodOpacity="0.4" />
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
          <span className="vibe-score-value">{score}</span>
        </div>

        {/* Supporting Text */}
        <div className="vibe-text-content">
          <div className="vibe-header">
            <Sparkles size={16} color="#fbbf24" />
            <span>Vibe Score</span>
          </div>
          <p className="vibe-subtext">
            +10 for on-time finishes, -5 for missed deadlines.
            <br />
            Keep it up!
          </p>
        </div>
      </div>
    </div>
  );
};
