import type { 
  Task, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  CompleteTaskResponse 
} from '../../types/contract';
import { request } from './client';

export const tasksApi = {
  /**
   * Retrieves all quests/tasks belonging to the authenticated user.
   * Dispatches GET /api/tasks
   */
  async getTasks(): Promise<Task[]> {
    return request<Task[]>('/tasks', {
      method: 'GET',
    });
  },

  /**
   * Creates a new quest.
   * Dispatches POST /api/tasks
   * Note: The client does NOT provide authoritative rewards; server calculates rewards.
   */
  async createTask(data: CreateTaskRequest): Promise<Task> {
    return request<Task>('/tasks', {
      method: 'POST',
      data,
    });
  },

  /**
   * Updates an existing quest owned by the user.
   * Dispatches PATCH /api/tasks/:id
   */
  async updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
    return request<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      data,
    });
  },

  /**
   * Deletes a quest owned by the user.
   * Dispatches DELETE /api/tasks/:id
   */
  async deleteTask(id: string): Promise<void> {
    await request<void>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Concludes a quest and triggers authoritative server progression.
   * Dispatches POST /api/tasks/:id/complete
   * NO reward calculations or XP numbers are sent from client!
   */
  async completeTask(id: string): Promise<CompleteTaskResponse> {
    return request<CompleteTaskResponse>(`/tasks/${id}/complete`, {
      method: 'POST',
      data: {},
    });
  },
};
