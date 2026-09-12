import React, { useState } from 'react';
import type { Task } from '../../../types/contract';

interface ProductivityTrendsCardProps {
  tasks?: Task[];
}

interface DayPoint {
  label: string;
  x: number;
  completed: number;
  failed: number;
}

export const ProductivityTrendsCard: React.FC<ProductivityTrendsCardProps> = ({ tasks = [] }) => {
  const [hoveredPoint, setHoveredPoint] = useState<DayPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // 7 days: Mon -> Today
  const days: DayPoint[] = [
    { label: 'Mon', x: 40, completed: 0, failed: 12 },
    { label: 'Tue', x: 110, completed: 0, failed: 0 },
    { label: 'Wed', x: 180, completed: 0, failed: 0 },
    { label: 'Thu', x: 250, completed: 0, failed: 0 },
    { label: 'Fri', x: 320, completed: 0, failed: 0 },
    { label: 'Sat', x: 390, completed: 0, failed: 0 },
    { label: 'Today', x: 460, completed: tasks.filter(t => t.completed).length, failed: 0 },
  ];

  // SVG dimensions
  const height = 180;
  const baselineY = 145;

  // Path calculation for the smooth curve matching the reference design
  // Mon starts at (40, 28) and swoops down smoothly with cubic bezier to (110, 145) then continues to (460, 145)
  const failedPathD = `M 40 28 C 65 30, 85 145, 110 145 L 460 145`;
  const failedAreaD = `M 40 28 C 65 30, 85 145, 110 145 L 460 145 L 460 145 L 40 145 Z`;

  // Completed line along baseline (or slight blip at Today)
  const todayCompleted = tasks.filter(t => t.completed).length;
  const todayCompletedY = todayCompleted > 0 ? Math.max(70, baselineY - todayCompleted * 20) : baselineY;
  const completedPathD = todayCompleted > 0
    ? `M 40 145 L 390 145 C 420 145, 435 ${todayCompletedY}, 460 ${todayCompletedY}`
    : `M 40 145 L 460 145`;

  return (
    <div className="analytics-card">
      <div className="trends-header">
        <h3 className="analytics-card-title">Productivity Trends</h3>
        <div className="trends-legend">
          <span className="trends-legend-item">
            <span className="trends-legend-dot completed" />
            <span>Completed</span>
          </span>
          <span className="trends-legend-item">
            <span className="trends-legend-dot overdue" />
            <span>Overdue / Failed</span>
          </span>
        </div>
      </div>

      <div className="chart-container">
        {hoveredPoint && tooltipPos && (
          <div
            className="analytics-tooltip"
            style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
          >
            <strong style={{ color: '#ffffff' }}>{hoveredPoint.label}</strong>
            <div>Completed: <span style={{ color: '#10b981', fontWeight: 600 }}>{hoveredPoint.completed}</span></div>
            <div>Overdue / Failed: <span style={{ color: '#f43f5e', fontWeight: 600 }}>{hoveredPoint.failed}</span></div>
          </div>
        )}

        <svg
          className="chart-svg"
          viewBox="0 0 500 180"
          preserveAspectRatio="none"
          onMouseLeave={() => {
            setHoveredPoint(null);
            setTooltipPos(null);
          }}
        >
          <defs>
            <linearGradient id="failedAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#f43f5e" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="failedLineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="25%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
          </defs>

          {/* Baseline horizontal grid line */}
          <line
            x1="30"
            y1={baselineY}
            x2="470"
            y2={baselineY}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1"
          />

          {/* Area Fill for Overdue / Failed */}
          <path
            d={failedAreaD}
            fill="url(#failedAreaGradient)"
          />

          {/* Stroke Line for Overdue / Failed */}
          <path
            d={failedPathD}
            fill="none"
            stroke="url(#failedLineGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Stroke Line for Completed */}
          <path
            d={completedPathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Interactive hover targets & points */}
          {days.map((day) => {
            const isHovered = hoveredPoint?.label === day.label;
            const ptY = day.label === 'Mon' ? 28 : (day.label === 'Today' && todayCompleted > 0 ? todayCompletedY : baselineY);
            return (
              <g
                key={day.label}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                  if (rect) {
                    const scaleX = rect.width / 500;
                    const scaleY = rect.height / 180;
                    setTooltipPos({
                      x: day.x * scaleX,
                      y: ptY * scaleY - 6,
                    });
                  }
                  setHoveredPoint(day);
                }}
              >
                {/* Transparent hit area */}
                <rect
                  x={day.x - 25}
                  y={0}
                  width={50}
                  height={height}
                  fill="transparent"
                />

                {/* Visible node point if hovered or key point */}
                {(isHovered || day.label === 'Mon') && (
                  <circle
                    cx={day.x}
                    cy={day.label === 'Mon' ? 28 : baselineY}
                    r={isHovered ? 5 : 3.5}
                    fill={day.label === 'Mon' ? '#f43f5e' : '#10b981'}
                    stroke="#0b0f17"
                    strokeWidth="2"
                  />
                )}

                {/* X Axis Label */}
                <text
                  x={day.x}
                  y={height - 10}
                  textAnchor="middle"
                  fill={isHovered ? '#f8fafc' : '#64748b'}
                  fontSize="11"
                  fontWeight={isHovered ? '600' : '400'}
                  fontFamily="Inter, sans-serif"
                >
                  {day.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
