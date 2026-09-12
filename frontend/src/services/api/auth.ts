import type { AuthMeResponse, SyncRequest } from '../../types/contract';
import { request } from './client';

export const authApi = {
  /**
   * Retrieves the currently authenticated user session and authoritative character data.
   * Dispatches GET /api/auth/me — Supabase access token is auto-attached by client.ts
   */
  async getMe(): Promise<AuthMeResponse> {
    return request<AuthMeResponse>('/auth/me', {
      method: 'GET',
    });
  },

  /**
   * Syncs a Supabase-authenticated user into our Prisma database.
   * Creates User + Character if they don't exist.
   * Dispatches POST /api/auth/sync
   */
  async sync(data?: SyncRequest): Promise<AuthMeResponse> {
    return request<AuthMeResponse>('/auth/sync', {
      method: 'POST',
      data: data || {},
    });
  },

  /**
   * Invalidates the active server session and clears authentication cookies.
   * Dispatches POST /api/auth/logout
   */
  async logout(): Promise<void> {
    await request<void>('/auth/logout', {
      method: 'POST',
    });
  },
};
