import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QuestsPage } from '../features/quests/QuestsPage';
import { QuestsContext } from '../context/questsContextDef';
import type { QuestsContextType } from '../context/questsContextDef';
import { AuthContext } from '../context/authContextDef';
import type { AuthContextType } from '../context/authContextDef';
import type { Task } from '../types/contract';

const mockTasks: Task[] = [
  {
    id: 'task-1',
    userId: 'usr_1',
    title: 'Conquer Dynamic Programming',
    description: 'Solve 2 LeetCode hard problems on graph theory.',
    categoryKey: 'intellect',
    difficulty: 'hard',
    completed: false,
    dueDate: '2026-09-15T23:59:59Z',
    createdAt: '2026-09-12T10:00:00Z',
  },
  {
    id: 'task-2',
    userId: 'usr_1',
    title: 'Morning Citadel Run',
    description: '5km cadence run through the lower ward.',
    categoryKey: 'strength',
    difficulty: 'medium',
    completed: true,
    completedAt: '2026-09-12T08:30:00Z',
    dueDate: '2026-09-12T12:00:00Z',
    createdAt: '2026-09-11T18:00:00Z',
  },
  {
    id: 'task-3',
    userId: 'usr_1',
    title: 'Read Ancient Philosophy',
    description: 'Read 3 chapters of Marcus Aurelius Meditations.',
    categoryKey: 'wisdom',
    difficulty: 'easy',
    completed: false,
    dueDate: '2026-09-14T20:00:00Z',
    createdAt: '2026-09-12T09:00:00Z',
  },
];

const createMockAuthContext = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
  user: { id: 'usr_1', email: 'adventurer@citadel.com', displayName: 'ValiantCoder' },
  character: { level: 4, totalXp: 1200, gold: 350, streakCurrent: 5, streakBest: 9 },
  isLoading: false,
  serverReachable: true,
  xpProgress: null,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  refreshSession: vi.fn(),
  reconcileCompletion: vi.fn(),
  ...overrides,
});

const createMockQuestsContext = (overrides: Partial<QuestsContextType> = {}): QuestsContextType => ({
  tasks: mockTasks,
  isLoading: false,
  error: null,
  pendingTaskIds: new Set<string>(),
  loadTasks: vi.fn().mockResolvedValue(undefined),
  createTask: vi.fn().mockResolvedValue({ ...mockTasks[0], id: 'new-task' }),
  updateTask: vi.fn().mockResolvedValue({ ...mockTasks[0] }),
  deleteTask: vi.fn().mockResolvedValue(undefined),
  completeTask: vi.fn().mockResolvedValue({
    task: { ...mockTasks[0], completed: true },
    rewards: { xp: 80, gold: 20 },
    progression: { levelBefore: 4, levelAfter: 4, totalXp: 1280, xpNextLevel: 500 },
  }),
  lastRewardNotice: null,
  clearRewardNotice: vi.fn(),
  levelUpEvent: null,
  clearLevelUpEvent: vi.fn(),
  ...overrides,
});

const renderQuestsPage = (
  questsOverrides: Partial<QuestsContextType> = {},
  authOverrides: Partial<AuthContextType> = {}
) => {
  const mockQuests = createMockQuestsContext(questsOverrides);
  const mockAuth = createMockAuthContext(authOverrides);

  const renderResult = render(
    <AuthContext.Provider value={mockAuth}>
      <QuestsContext.Provider value={mockQuests}>
        <BrowserRouter>
          <QuestsPage />
        </BrowserRouter>
      </QuestsContext.Provider>
    </AuthContext.Provider>
  );

  return { ...renderResult, mockQuests, mockAuth };
};

describe('Quest System UI & CRUD Operations', () => {
  it('renders quest board header, statistics, and task cards', () => {
    renderQuestsPage();

    // Verify Board Header & Stats
    expect(screen.getByRole('heading', { name: /Quest Board & Task Engine/i })).toBeInTheDocument();
    expect(screen.getByText('Total Quests')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // 3 total
    expect(screen.getByText('Active Trials')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 active
    expect(screen.getByText('Victories Claimed')).toBeInTheDocument();

    // Verify Quest Cards
    expect(screen.getByText('Conquer Dynamic Programming')).toBeInTheDocument();
    expect(screen.getByText('Morning Citadel Run')).toBeInTheDocument();
    expect(screen.getByText('Read Ancient Philosophy')).toBeInTheDocument();

    // Verify Discipline & Difficulty badges
    expect(screen.getAllByText(/intellect/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/strength/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/hard/i).length).toBeGreaterThan(0);
  });

  it('filters quests by search text and status filters', () => {
    renderQuestsPage();

    // Search for "LeetCode"
    const searchInput = screen.getByPlaceholderText(/Search active or completed quests/i);
    fireEvent.change(searchInput, { target: { value: 'LeetCode' } });

    expect(screen.getByText('Conquer Dynamic Programming')).toBeInTheDocument();
    expect(screen.queryByText('Morning Citadel Run')).not.toBeInTheDocument();

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });

    // Click "Active" status tab
    const activeTab = screen.getByRole('tab', { name: /Active/i });
    fireEvent.click(activeTab);

    expect(screen.getByText('Conquer Dynamic Programming')).toBeInTheDocument();
    expect(screen.getByText('Read Ancient Philosophy')).toBeInTheDocument();
    expect(screen.queryByText('Morning Citadel Run')).not.toBeInTheDocument();

    // Click "Completed" status tab
    const completedTab = screen.getByRole('tab', { name: /Completed/i });
    fireEvent.click(completedTab);

    expect(screen.getByText('Morning Citadel Run')).toBeInTheDocument();
    expect(screen.queryByText('Conquer Dynamic Programming')).not.toBeInTheDocument();
  });

  it('handles empty search results and provides a reset button', () => {
    renderQuestsPage();

    const searchInput = screen.getByPlaceholderText(/Search active or completed quests/i);
    fireEvent.change(searchInput, { target: { value: 'NonexistentSearch12345' } });

    expect(screen.getByText(/No Quests Match Your Filter/i)).toBeInTheDocument();
    const resetBtn = screen.getByRole('button', { name: /Reset Filters/i });
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(screen.getByText('Conquer Dynamic Programming')).toBeInTheDocument();
  });

  it('calls completeTask when checkbox is clicked', async () => {
    const { mockQuests } = renderQuestsPage();

    // Click complete checkbox button for task-1
    const completeBtn = screen.getByRole('checkbox', {
      name: /Mark quest "Conquer Dynamic Programming" as complete/i,
    });
    fireEvent.click(completeBtn);

    await waitFor(() => {
      expect(mockQuests.completeTask).toHaveBeenCalledWith('task-1');
      expect(mockQuests.completeTask).toHaveBeenCalledTimes(1);
    });
  });

  it('prevents duplicate clicks while completion is pending', () => {
    // pendingTaskIds contains 'task-1'
    const pendingSet = new Set(['task-1']);
    const { mockQuests } = renderQuestsPage({ pendingTaskIds: pendingSet });

    const completeBtn = screen.getByRole('checkbox', {
      name: /Mark quest "Conquer Dynamic Programming" as complete/i,
    });
    expect(completeBtn).toBeDisabled();

    fireEvent.click(completeBtn);
    expect(mockQuests.completeTask).not.toHaveBeenCalled();
  });

  it('opens composer modal, submits new quest, and calls createTask', async () => {
    const { mockQuests } = renderQuestsPage();

    const newQuestBtn = screen.getByRole('button', { name: /New Quest/i });
    fireEvent.click(newQuestBtn);

    expect(screen.getByRole('heading', { name: /Forge a New Quest/i })).toBeInTheDocument();

    // Fill Title
    const titleInput = screen.getByLabelText(/Quest Objective/i);
    fireEvent.change(titleInput, { target: { value: 'Master Vitest Automation' } });

    // Fill Description
    const descInput = screen.getByLabelText(/Tactical Briefing/i);
    fireEvent.change(descInput, { target: { value: 'Ensure 100% unit test coverage for quest flow' } });

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Embark/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockQuests.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Master Vitest Automation',
          description: 'Ensure 100% unit test coverage for quest flow',
          categoryKey: 'intellect',
          difficulty: 'medium',
        })
      );
    });
  });

  it('opens edit modal pre-filled with quest and calls updateTask', async () => {
    const { mockQuests } = renderQuestsPage();

    // Find and click edit button for task-1
    const editBtn = screen.getByLabelText(/Edit quest Conquer Dynamic Programming/i);
    fireEvent.click(editBtn);

    expect(screen.getByRole('heading', { name: /Modify Quest/i })).toBeInTheDocument();

    // Title should be pre-filled
    const titleInput = screen.getByLabelText(/Quest Objective/i);
    expect(titleInput).toHaveValue('Conquer Dynamic Programming');

    // Change title
    fireEvent.change(titleInput, { target: { value: 'Conquer Advanced DP & Memoization' } });

    // Submit
    const saveBtn = screen.getByRole('button', { name: /Update Quest/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockQuests.updateTask).toHaveBeenCalledWith(
        'task-1',
        expect.objectContaining({
          title: 'Conquer Advanced DP & Memoization',
        })
      );
    });
  });

  it('opens delete confirmation modal and calls deleteTask upon confirmation', async () => {
    const { mockQuests } = renderQuestsPage();

    const deleteBtn = screen.getByLabelText(/Abandon quest Conquer Dynamic Programming/i);
    fireEvent.click(deleteBtn);

    expect(screen.getByRole('heading', { name: /Abandon Quest\?/i })).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you wish to abandon/i)).toBeInTheDocument();

    // Click confirm
    const confirmBtn = screen.getByRole('button', { name: /^Abandon Quest$/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockQuests.deleteTask).toHaveBeenCalledWith('task-1');
    });
  });

  it('closes composer modal when Escape key is pressed', () => {
    renderQuestsPage();

    const newQuestBtn = screen.getByRole('button', { name: /New Quest/i });
    fireEvent.click(newQuestBtn);
    expect(screen.getByRole('heading', { name: /Forge a New Quest/i })).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

    expect(screen.queryByRole('heading', { name: /Forge a New Quest/i })).not.toBeInTheDocument();
  });

  it('displays loading skeletons when isLoading is true', () => {
    renderQuestsPage({ isLoading: true, tasks: [] });

    expect(screen.getByLabelText(/Loading quests/i)).toBeInTheDocument();
  });

  it('displays error banner and triggers retry when error occurs', () => {
    const { mockQuests } = renderQuestsPage({
      error: 'Citadel server is offline. Task board cannot sync.',
    });

    expect(screen.getByRole('alert')).toHaveTextContent(/Citadel server is offline/i);

    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    fireEvent.click(retryBtn);

    expect(mockQuests.loadTasks).toHaveBeenCalled();
  });
});
