import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProductivityTrendsCard } from '../features/dashboard/components/ProductivityTrendsCard';
import { CompletedCategoriesCard } from '../features/dashboard/components/CompletedCategoriesCard';
import { VibeScoreCard } from '../features/dashboard/components/VibeScoreCard';
import { ConsistencyHeatmapCard } from '../features/dashboard/components/ConsistencyHeatmapCard';
import { AccountabilityMatrix } from '../features/dashboard/components/AccountabilityMatrix';
import type { Task } from '../types/contract';

const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Daily Meditation',
    categoryKey: 'vitality',
    difficulty: 'easy',
    completed: true,
    completedAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Algorithm Drill',
    categoryKey: 'intellect',
    difficulty: 'hard',
    completed: false,
    dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

describe('Productivity Analytics Dashboard Components (100% Real User Data)', () => {
  it('renders ProductivityTrendsCard with title, legend, and timeline', () => {
    render(<ProductivityTrendsCard tasks={mockTasks} />);
    expect(screen.getByText('Productivity Trends')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Overdue / Failed')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('renders CompletedCategoriesCard with dynamic real counts and percentages', () => {
    render(<CompletedCategoriesCard tasks={mockTasks} />);
    expect(screen.getByText('Completed Categories')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('TOTAL')).toBeInTheDocument();
    expect(screen.getByText(/Personal/)).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders VibeScoreCard dynamically computed from real on-time and missed quests', () => {
    render(<VibeScoreCard tasks={mockTasks} />);
    expect(screen.getByText('Vibe Score')).toBeInTheDocument();
    // 0 base + 1 on-time (+10) - 1 missed (-5) = 5
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText(/\+10 for on-time finishes \(1\), -5 for missed deadlines \(1\)/i)).toBeInTheDocument();
  });

  it('renders ConsistencyHeatmapCard with title and 35 cells reflecting real activity', () => {
    const { container } = render(<ConsistencyHeatmapCard tasks={mockTasks} />);
    expect(screen.getByText('35-Day Consistency Heatmap')).toBeInTheDocument();
    const cells = container.querySelectorAll('.heatmap-cell');
    expect(cells.length).toBe(35);
  });

  it('renders AccountabilityMatrix with only real user tasks and supports failure filtering', () => {
    render(<AccountabilityMatrix tasks={mockTasks} />);
    expect(screen.getByText('The Accountability Matrix')).toBeInTheDocument();
    expect(screen.getByText('All Time')).toBeInTheDocument();
    expect(screen.getByText('Failures')).toBeInTheDocument();

    // Verify column headers
    expect(screen.getByText('TASK NAME')).toBeInTheDocument();
    expect(screen.getByText('CATEGORY')).toBeInTheDocument();
    expect(screen.getByText('DUE DATE')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED AT')).toBeInTheDocument();
    expect(screen.getByText('STATUS')).toBeInTheDocument();

    // Verify real user tasks exist
    expect(screen.getByText('Daily Meditation')).toBeInTheDocument();
    expect(screen.getByText('Algorithm Drill')).toBeInTheDocument();

    // Click Failures filter
    const failuresBtn = screen.getByRole('button', { name: 'Failures' });
    fireEvent.click(failuresBtn);
    expect(failuresBtn).toHaveClass('active');

    // Done items should be filtered out
    expect(screen.queryByText('Daily Meditation')).not.toBeInTheDocument();
    // Overdue items should remain
    expect(screen.getByText('Algorithm Drill')).toBeInTheDocument();
  });
});
