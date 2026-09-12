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
import { QuestsContext, type RewardNotice } from './questsContextDef';

export const QuestsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, reconcileCompletion } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingTaskIds, setPendingTaskIds] = useState<Set<string>>(new Set());
  const [lastRewardNotice, setLastRewardNotice] = useState<RewardNotice | null>(null);

  const loadTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await tasksApi.getTasks();
      // Ensure tasks is always an array
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
  }, [user]);

  useEffect(() => {
    let ignore = false;
    if (!user) return;

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
  }, [user]);

  const createTask = async (data: CreateTaskRequest): Promise<Task> => {
    setError(null);
    const newTask = await tasksApi.createTask(data);
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = async (id: string, data: UpdateTaskRequest): Promise<Task> => {
    setError(null);
    const updated = await tasksApi.updateTask(id, data);
    setTasks(prev => prev.map(t => (t.id === id ? updated : t)));
    return updated;
  };

  const deleteTask = async (id: string): Promise<void> => {
    if (pendingTaskIds.has(id)) return;

    setPendingTaskIds(prev => new Set(prev).add(id));
    setError(null);
    try {
      await tasksApi.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
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
      reconcileCompletion(res);

      // Trigger temporary reward notification
      if (res.rewards) {
        setLastRewardNotice({
          taskId: id,
          xp: res.rewards.xp,
          gold: res.rewards.gold,
          attribute: res.rewards.attribute,
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
      }}
    >
      {children}
    </QuestsContext.Provider>
  );
};
