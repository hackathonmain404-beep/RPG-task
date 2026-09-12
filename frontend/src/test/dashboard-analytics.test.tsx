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

describe('Productivity Analytics Dashboard Components', () => {
  it('renders ProductivityTrendsCard with title, legend, and timeline', () => {
    render(<ProductivityTrendsCard tasks={mockTasks} />);
    expect(screen.getByText('Productivity Trends')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Overdue / Failed')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('renders CompletedCategoriesCard with donut center and category breakdown', () => {
    render(<CompletedCategoriesCard tasks={mockTasks} />);
    expect(screen.getByText('Completed Categories')).toBeInTheDocument();
    expect(screen.getByText('TOTAL')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Imp. Work')).toBeInTheDocument();
    expect(screen.getByText('Learning')).toBeInTheDocument();
  });

  it('renders VibeScoreCard with circular score and supporting text', () => {
    render(<VibeScoreCard tasks={mockTasks} />);
    expect(screen.getByText('Vibe Score')).toBeInTheDocument();
    expect(screen.getByText(/165/)).toBeInTheDocument(); // 155 base + 1 completed * 10
    expect(screen.getByText(/\+10 for on-time finishes, -5 for missed deadlines/i)).toBeInTheDocument();
  });

  it('renders ConsistencyHeatmapCard with title and 35 cells', () => {
    const { container } = render(<ConsistencyHeatmapCard tasks={mockTasks} />);
    expect(screen.getByText('35-Day Consistency Heatmap')).toBeInTheDocument();
    const cells = container.querySelectorAll('.heatmap-cell');
    expect(cells.length).toBe(35);
  });

  it('renders AccountabilityMatrix and filters tasks', () => {
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

    // Verify task row items exist
    expect(screen.getByText('Fix the coin compensation that gives coins (1000) when a user log out and log in')).toBeInTheDocument();

    // Click Failures filter
    const failuresBtn = screen.getByRole('button', { name: 'Failures' });
    fireEvent.click(failuresBtn);
    expect(failuresBtn).toHaveClass('active');

    // Done items should be filtered out
    expect(screen.queryByText('Make the landing page')).not.toBeInTheDocument();
    // Overdue items should remain
    expect(screen.getByText('Fix the coin compensation that gives coins (1000) when a user log out and log in')).toBeInTheDocument();
  });
});
