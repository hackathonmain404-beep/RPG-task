import type { AuthMeResponse, LoginRequest, RegisterRequest } from '../../types/contract';
import { request } from './client';

export const authApi = {
  /**
   * Retrieves the currently authenticated user session and authoritative character data.
   * Dispatches GET /api/auth/me
   */
  async getMe(): Promise<AuthMeResponse> {
    return request<AuthMeResponse>('/auth/me', {
      method: 'GET',
    });
  },

  /**
   * Creates a new user account and initializes player character.
   * Dispatches POST /api/auth/register
   */
  async register(data: RegisterRequest): Promise<AuthMeResponse> {
    return request<AuthMeResponse>('/auth/register', {
      method: 'POST',
      data,
    });
  },

  /**
   * Authenticates user credentials and establishes server session.
   * Dispatches POST /api/auth/login
   */
  async login(data: LoginRequest): Promise<AuthMeResponse> {
    return request<AuthMeResponse>('/auth/login', {
      method: 'POST',
      data,
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
