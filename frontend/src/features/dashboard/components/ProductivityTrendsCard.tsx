import React, { useState, useMemo } from 'react';
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

  const height = 180;
  const baselineY = 145;

  // Calculate 7-day productivity trend strictly from user's actual tasks
  const days: DayPoint[] = useMemo(() => {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);

      // Map day index to day name
      const dayOfWeek = (d.getDay() + 6) % 7; // Monday = 0
      const label = i === 6 ? 'Today' : dayNames[dayOfWeek];
      const x = 40 + i * 70;

      // Real completed tasks for this calendar day
      const completed = tasks.filter(t => {
        if (!t.completed) return false;
        const compDate = t.completedAt ? new Date(t.completedAt) : t.updatedAt ? new Date(t.updatedAt) : null;
        if (!compDate) return i === 6; // If no timestamp, associate with today
        return compDate >= d && compDate < nextD;
      }).length;

      // Real failed/overdue tasks for this calendar day
      const failed = tasks.filter(t => {
        if (t.completed || !t.dueDate) return false;
        const dueDate = new Date(t.dueDate);
        return dueDate >= d && dueDate < nextD && dueDate < now;
      }).length;

      return {
        label,
        x,
        completed,
        failed,
      };
    });
  }, [tasks]);

  // Compute maximum count for scaling
  const maxVal = Math.max(1, ...days.map(d => Math.max(d.completed, d.failed)));
  const getY = (val: number) => {
    if (val === 0) return baselineY;
    return baselineY - (val / maxVal) * (baselineY - 35);
  };

  // Build SVG path for failed curve
  const failedPathD = useMemo(() => {
    const points = days.map(d => ({ x: d.x, y: getY(d.failed) }));
    if (points.every(p => p.y === baselineY)) {
      return `M 40 ${baselineY} L 460 ${baselineY}`;
    }
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [days, maxVal]);

  const failedAreaD = useMemo(() => {
    return `${failedPathD} L 460 ${baselineY} L 40 ${baselineY} Z`;
  }, [failedPathD]);

  // Build SVG path for completed curve
  const completedPathD = useMemo(() => {
    const points = days.map(d => ({ x: d.x, y: getY(d.completed) }));
    if (points.every(p => p.y === baselineY)) {
      return `M 40 ${baselineY} L 460 ${baselineY}`;
    }
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [days, maxVal]);

  return (
    <div className="analytics-card card-analytics-trends anim-entrance-5">
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
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
              <stop offset="80%" stopColor="#f43f5e" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="failedLineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="50%" stopColor="#f43f5e" />
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

          {/* Vertical Guide Crosshair when hovering */}
          {hoveredPoint && (
            <line
              x1={hoveredPoint.x}
              y1={25}
              x2={hoveredPoint.x}
              y2={baselineY}
              className="chart-vertical-crosshair"
            />
          )}

          {/* Area Fill for Overdue / Failed */}
          {days.some(d => d.failed > 0) && (
            <path
              d={failedAreaD}
              fill="url(#failedAreaGradient)"
            />
          )}

          {/* Stroke Line for Overdue / Failed with entrance draw */}
          <path
            d={failedPathD}
            fill="none"
            stroke="url(#failedLineGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="chart-line-draw-failed"
          />

          {/* Stroke Line for Completed with entrance draw */}
          <path
            d={completedPathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="chart-line-draw-completed"
          />

          {/* Interactive hover targets & points */}
          {days.map((day) => {
            const isHovered = hoveredPoint?.label === day.label;
            const ptY = day.completed > 0 ? getY(day.completed) : day.failed > 0 ? getY(day.failed) : baselineY;
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

                {/* Visible node point if count > 0 or hovered */}
                {(day.completed > 0 || day.failed > 0 || isHovered) && (
                  <circle
                    cx={day.x}
                    cy={ptY}
                    r={isHovered ? 5.5 : 3.5}
                    fill={day.failed > 0 ? '#f43f5e' : '#10b981'}
                    stroke="#0b0f17"
                    strokeWidth="2"
                    className="chart-node-glow"
                    filter={isHovered ? 'drop-shadow(0 0 6px #10b981)' : undefined}
                  />
                )}

                {/* X Axis Label */}
                <text
                  x={day.x}
                  y={height - 10}
                  textAnchor="middle"
                  fill={isHovered ? '#f8fafc' : '#64748b'}
                  fontSize="11"
                  fontWeight={isHovered ? '700' : '400'}
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
