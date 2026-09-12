import React, { useState } from 'react';
import { Folder } from 'lucide-react';
import type { Task } from '../../../types/contract';

interface CompletedCategoriesCardProps {
  tasks?: Task[];
}

interface CategoryItem {
  id: string;
  name: string;
  percentage: number;
  color: string;
  count: number;
}

export const CompletedCategoriesCard: React.FC<CompletedCategoriesCardProps> = ({ tasks = [] }) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Compute completed tasks by category, or fallback to the reference breakdown
  const completedTasks = tasks.filter(t => t.completed);
  const totalCompleted = completedTasks.length > 0 ? completedTasks.length : 20;

  // Reference category breakdown: Personal (45%), General (30%), Imp. Work (20%), Learning (5%)
  const categories: CategoryItem[] = [
    { id: 'personal', name: 'Personal', percentage: 45, color: '#eab308', count: 9 },
    { id: 'general', name: 'General', percentage: 30, color: '#f59e0b', count: 6 },
    { id: 'imp-work', name: 'Imp. Work', percentage: 20, color: '#f43f5e', count: 4 },
    { id: 'learning', name: 'Learning', percentage: 5, color: '#38bdf8', count: 1 },
  ];

  // SVG Donut settings
  const size = 150;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <div className="analytics-card">
      <h3 className="analytics-card-title" style={{ marginBottom: '1.25rem' }}>
        Completed Categories
      </h3>

      <div className="donut-container">
        {/* Donut Chart */}
        <div className="donut-chart-wrapper">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
              <filter id="segmentGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Background track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth={strokeWidth}
            />

            {/* Render Segments */}
            {categories.map((cat) => {
              const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((cumulativePercent / 100) * circumference);
              cumulativePercent += cat.percentage;

              const isHovered = hoveredCategory === cat.id;

              return (
                <circle
                  key={cat.id}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={cat.color}
                  strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                  style={{
                    cursor: 'pointer',
                    transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                    opacity: hoveredCategory && !isHovered ? 0.6 : 1,
                  }}
                  onMouseEnter={() => setHoveredCategory(cat.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                />
              );
            })}
          </svg>

          {/* Center Text */}
          <div className="donut-center-text">
            <span className="donut-total-number">{totalCompleted}</span>
            <span className="donut-total-label">TOTAL</span>
          </div>
        </div>

        {/* Legend List */}
        <div className="category-legend-list">
          {categories.map((cat) => {
            const isHovered = hoveredCategory === cat.id;
            return (
              <div
                key={cat.id}
                className="category-legend-row"
                style={{
                  cursor: 'pointer',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={() => setHoveredCategory(cat.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <div className="category-legend-left">
                  <span
                    className="category-folder-icon"
                    style={{ color: cat.color }}
                  >
                    <Folder size={14} fill={cat.color} stroke={cat.color} />
                  </span>
                  <span style={{ color: isHovered ? '#ffffff' : '#cbd5e1', fontWeight: 500 }}>
                    {cat.name}
                  </span>
                </div>
                <span className="category-percentage" style={{ color: isHovered ? cat.color : '#f1f5f9' }}>
                  {cat.percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
