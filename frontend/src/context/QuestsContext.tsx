import React, { useState, useEffect, useCallback } from 'react';
import type { 
  Task, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  CompleteTaskResponse 
} from '../types/contract';
import { ApiError } from '../types/contract';
import { tasksApi } from '../services/api/tasks';
import { useAuth } from './useAuth';
import { QuestsContext, type RewardNotice, type LevelUpEvent } from './questsContextDef';

const GUEST_STARTER_QUESTS: Task[] = [
  {
    id: 'guest_task_1',
    userId: 'guest',
    title: 'Explore the Citadel Realm',
    description: 'Begin your journey by inspecting your attributes and character sheet.',
    categoryKey: 'intellect',
    difficulty: 'easy',
    completed: false,
    completedAt: null,
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'guest_task_2',
    userId: 'guest',
    title: 'Daily Training & Physical Fitness',
    description: 'Engage in 20 minutes of physical conditioning to build strength and vitality.',
    categoryKey: 'vitality',
    difficulty: 'medium',
    completed: false,
    completedAt: null,
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'guest_task_3',
    userId: 'guest',
    title: 'Study Arcane Lore & Technology',
    description: 'Sharpen your intellect and wisdom with deep technical focus.',
    categoryKey: 'wisdom',
    difficulty: 'hard',
    completed: false,
    completedAt: null,
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function getGuestStorageTasks(): Task[] {
  try {
    const raw = localStorage.getItem('liferpg_guest_quests');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Ignore storage parse errors
  }
  return GUEST_STARTER_QUESTS;
}

function saveGuestStorageTasks(tasks: Task[]): void {
  try {
    localStorage.setItem('liferpg_guest_quests', JSON.stringify(tasks));
  } catch {
    // Ignore storage quota errors
  }
}

function calculateGuestReward(difficulty: string = 'medium', categoryKey: string = 'intellect') {
  const matrix: Record<string, { xp: number; gold: number; attr: number }> = {
    easy: { xp: 35, gold: 10, attr: 4 },
    medium: { xp: 70, gold: 18, attr: 8 },
    hard: { xp: 140, gold: 40, attr: 16 },
    epic: { xp: 280, gold: 80, attr: 32 },
  };
  const diff = matrix[difficulty.toLowerCase()] || matrix.medium;
  return {
    xp: diff.xp,
    gold: diff.gold,
    attribute: {
      key: categoryKey,
      name: categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1),
      amount: diff.attr,
    },
  };
}

function computeGuestProgression(currentTotalXp: number, xpGained: number, currentLevel: number = 1) {
  const newTotalXp = currentTotalXp + xpGained;
  let level = 1;
  while (Math.floor(100 * Math.pow(level, 1.65)) <= newTotalXp) {
    level++;
  }
  const currentLevelXp = Math.floor(100 * Math.pow(level - 1, 1.65));
  const nextLevelXp = Math.floor(100 * Math.pow(level, 1.65));
  const progressPercent = Math.min(100, Math.max(0, Math.round(((newTotalXp - currentLevelXp) / Math.max(1, nextLevelXp - currentLevelXp)) * 100)));

  return {
    levelBefore: currentLevel,
    levelAfter: level,
    totalXp: newTotalXp,
    currentLevelXp,
    nextLevelXp,
    progressPercent,
  };
}

export const QuestsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, character, isGuest, reconcileCompletion, revalidateUserData } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingTaskIds, setPendingTaskIds] = useState<Set<string>>(new Set());
  const [lastRewardNotice, setLastRewardNotice] = useState<RewardNotice | null>(null);
  const [levelUpEvent, setLevelUpEvent] = useState<LevelUpEvent | null>(null);

  // Listen to global logout event to cleanly isolate user state
  useEffect(() => {
    const handleLogout = () => {
      setTasks([]);
      setError(null);
      setPendingTaskIds(new Set());
    };
    window.addEventListener('liferpg-user-logged-out', handleLogout);
    return () => window.removeEventListener('liferpg-user-logged-out', handleLogout);
  }, []);

  const loadTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    if (isGuest) {
      setTasks(getGuestStorageTasks());
      setIsLoading(false);
      setError(null);
      return;
    }

    if (tasks.length === 0) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const data = await tasksApi.getTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'NETWORK_ERROR' || err.status === 0) {
          setError('Citadel server is offline. Task board cannot sync.');
        } else {
          setError(err.message || 'Failed to load quests.');
        }
      } else {
        setError('Failed to retrieve quests from server.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, isGuest]);

  useEffect(() => {
    let ignore = false;
    if (!user) return;

    if (isGuest) {
      setTasks(getGuestStorageTasks());
      setIsLoading(false);
      return;
    }

    tasksApi.getTasks()
      .then(data => {
        if (!ignore) {
          setTasks(Array.isArray(data) ? data : []);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          if (err instanceof ApiError && (err.code === 'NETWORK_ERROR' || err.status === 0)) {
            setError('Citadel server is offline. Task board cannot sync.');
          } else {
            setError(err instanceof Error ? err.message : 'Failed to retrieve quests from server.');
          }
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [user, isGuest]);

  const createTask = async (data: CreateTaskRequest): Promise<Task> => {
    setError(null);

    if (isGuest) {
      const reward = calculateGuestReward(data.difficulty, data.categoryKey);
      const newTask: Task = {
        id: `guest_task_${Date.now()}`,
        userId: user?.id || 'guest',
        title: data.title,
        description: data.description ?? null,
        categoryKey: data.categoryKey || 'intellect',
        difficulty: data.difficulty || 'medium',
        xpReward: reward.xp,
        goldReward: reward.gold,
        completed: false,
        completedAt: null,
        dueDate: data.dueDate ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTasks(prev => {
        const next = [newTask, ...prev];
        saveGuestStorageTasks(next);
        return next;
      });
      return newTask;
    }

    const newTask = await tasksApi.createTask(data);
    setTasks(prev => [newTask, ...prev]);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('liferpg-user-data-synced', {
          detail: { type: 'quest_created', taskId: newTask.id, userId: user?.id },
        })
      );
    }
    return newTask;
  };

  const updateTask = async (id: string, data: UpdateTaskRequest): Promise<Task> => {
    setError(null);

    if (isGuest) {
      let updatedTask: Task | null = null;
      setTasks(prev => {
        const next = prev.map(t => {
          if (t.id === id) {
            updatedTask = {
              ...t,
              ...data,
              description: data.description !== undefined ? data.description : t.description,
              dueDate: data.dueDate !== undefined ? data.dueDate : t.dueDate,
              updatedAt: new Date().toISOString(),
            };
            return updatedTask;
          }
          return t;
        });
        saveGuestStorageTasks(next);
        return next;
      });
      return updatedTask || (tasks.find(t => t.id === id) as Task);
    }

    const updated = await tasksApi.updateTask(id, data);
    setTasks(prev => prev.map(t => (t.id === id ? updated : t)));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('liferpg-user-data-synced', {
          detail: { type: 'quest_updated', taskId: id, userId: user?.id },
        })
      );
    }
    return updated;
  };

  const deleteTask = async (id: string): Promise<void> => {
    if (pendingTaskIds.has(id)) return;

    setPendingTaskIds(prev => new Set(prev).add(id));
    setError(null);
    try {
      if (isGuest) {
        setTasks(prev => {
          const next = prev.filter(t => t.id !== id);
          saveGuestStorageTasks(next);
          return next;
        });
        return;
      }

      await tasksApi.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('liferpg-user-data-synced', {
            detail: { type: 'quest_deleted', taskId: id, userId: user?.id },
          })
        );
      }
    } finally {
      setPendingTaskIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const completeTask = async (id: string): Promise<CompleteTaskResponse> => {
    // 1. Duplicate click prevention guard
    if (pendingTaskIds.has(id)) {
      throw new Error('Quest completion already in progress.');
    }

    // Find original task for potential rollback
    const originalTask = tasks.find(t => t.id === id);
    if (!originalTask || originalTask.completed) {
      throw new Error('Quest is already marked completed.');
    }

    // Lock action ID
    setPendingTaskIds(prev => new Set(prev).add(id));
    setError(null);

    // Guest Mode local transaction
    if (isGuest) {
      try {
        const now = new Date().toISOString();
        const reward = calculateGuestReward(originalTask.difficulty, originalTask.categoryKey);
        const currentTotalXp = character?.totalXp ?? 0;
        const currentLevel = character?.level ?? 1;
        const prog = computeGuestProgression(currentTotalXp, reward.xp, currentLevel);
        const streakCurrent = (character?.streakCurrent ?? 0) + 1;
        const streakBest = Math.max(streakCurrent, character?.streakBest ?? 1);

        const res: CompleteTaskResponse = {
          task: {
            id: originalTask.id,
            completed: true,
            completedAt: now,
          },
          rewards: {
            xp: reward.xp,
            gold: reward.gold,
            attribute: reward.attribute,
          },
          progression: {
            levelBefore: prog.levelBefore,
            levelAfter: prog.levelAfter,
            totalXp: prog.totalXp,
            currentLevelXp: prog.currentLevelXp,
            nextLevelXp: prog.nextLevelXp,
            progressPercent: prog.progressPercent,
          },
          streak: {
            current: streakCurrent,
            best: streakBest,
          },
        };

        setTasks(prev => {
          const next = prev.map(t =>
            t.id === id
              ? {
                  ...t,
                  completed: true,
                  completedAt: now,
                  xpReward: reward.xp,
                  goldReward: reward.gold,
                }
              : t
          );
          saveGuestStorageTasks(next);
          return next;
        });

        reconcileCompletion(res, originalTask.title);

        setLastRewardNotice({
          taskId: id,
          xp: reward.xp,
          gold: reward.gold,
          attribute: reward.attribute,
        });

        if (prog.levelAfter > prog.levelBefore) {
          setLevelUpEvent({
            levelBefore: prog.levelBefore,
            levelAfter: prog.levelAfter,
          });
        }

        return res;
      } finally {
        setPendingTaskIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    }

    // 2. Optimistic UI update (immediate responsive checkmark)
    setTasks(prev =>
      prev.map(t =>
        t.id === id ? { ...t, completed: true, completedAt: new Date().toISOString() } : t
      )
    );

    try {
      // 3. Authoritative server transaction call
      const res = await tasksApi.completeTask(id);

      // Reconcile task with server confirmed task state
      setTasks(prev =>
        prev.map(t =>
          t.id === id
            ? {
                ...t,
                completed: res.task?.completed ?? true,
                completedAt: res.task?.completedAt ?? t.completedAt,
              }
            : t
        )
      );

      // Reconcile character progression on AuthContext
      const completedTask = tasks.find(t => t.id === id);
      reconcileCompletion(res, completedTask?.title);

      // Force background synchronization of full character sheet & dependent UI
      if (revalidateUserData) {
        void revalidateUserData();
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('liferpg-user-data-synced', {
            detail: { type: 'quest_completed', taskId: id, userId: user?.id },
          })
        );
      }

      // Trigger temporary reward notification
      if (res.rewards) {
        setLastRewardNotice({
          taskId: id,
          xp: res.rewards.xp,
          gold: res.rewards.gold,
          attribute: res.rewards.attribute,
        });
      }

      // Check for level-up event from server-authoritative progression
      if (
        res.progression?.levelBefore != null &&
        res.progression?.levelAfter != null &&
        res.progression.levelAfter > res.progression.levelBefore
      ) {
        setLevelUpEvent({
          levelBefore: res.progression.levelBefore,
          levelAfter: res.progression.levelAfter,
        });
      }

      return res;
    } catch (err) {
      // 4. Rollback on failure
      if (err instanceof ApiError && err.code === 'TASK_ALREADY_COMPLETED') {
        // Task was already completed on server, preserve completed state
        setTasks(prev => prev.map(t => (t.id === id ? { ...t, completed: true } : t)));
      } else {
        // Full rollback to uncompleted
        setTasks(prev =>
          prev.map(t =>
            t.id === id ? { ...t, completed: false, completedAt: originalTask.completedAt } : t
          )
        );
      }

      const message = err instanceof Error ? err.message : 'Failed to complete quest';
      setError(message);
      throw err;
    } finally {
      // Release lock
      setPendingTaskIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const clearRewardNotice = () => {
    setLastRewardNotice(null);
  };

  const clearLevelUpEvent = () => {
    setLevelUpEvent(null);
  };

  return (
    <QuestsContext.Provider
      value={{
        tasks,
        isLoading,
        error,
        pendingTaskIds,
        loadTasks,
        createTask,
        updateTask,
        deleteTask,
        completeTask,
        lastRewardNotice,
        clearRewardNotice,
        levelUpEvent,
        clearLevelUpEvent,
      }}
    >
      {children}
    </QuestsContext.Provider>
  );
};
