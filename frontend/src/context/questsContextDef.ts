import { createContext } from 'react';
import type { 
  Task, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  CompleteTaskResponse 
} from '../types/contract';

export interface RewardNotice {
  taskId: string;
  xp?: number;
  gold?: number;
  attribute?: {
    key: string;
    amount: number;
  };
}

export interface QuestsContextType {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  pendingTaskIds: Set<string>;
  loadTasks: () => Promise<void>;
  createTask: (data: CreateTaskRequest) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskRequest) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<CompleteTaskResponse>;
  lastRewardNotice: RewardNotice | null;
  clearRewardNotice: () => void;
}

export const QuestsContext = createContext<QuestsContextType | undefined>(undefined);
