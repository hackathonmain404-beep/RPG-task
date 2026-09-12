/**
 * Character API Service
 * 
 * Calls the backend GET /api/character endpoint for the full character sheet
 * including server-authoritative attribute values.
 */
import type { Character, Attribute } from '../../types/contract';
import { ApiError } from '../../types/contract';

export interface CharacterResponse {
  level: number;
  totalXp: number;
  gold: number;
  streakCurrent: number;
  streakBest: number;
  attributes: Attribute[];
}

const API_BASE = '/api';

export const characterApi = {
  /**
   * GET /api/character
   * Returns the full character sheet with attributes from the server.
   */
  async getCharacter(): Promise<CharacterResponse> {
    const res = await fetch(`${API_BASE}/character`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      let errorData: { error?: { code?: string; message?: string } } = {};
      try {
        errorData = await res.json();
      } catch {
        // Response body may not be JSON
      }
      throw new ApiError(
        errorData.error?.code || 'UNKNOWN_ERROR',
        errorData.error?.message || `HTTP ${res.status}`,
        res.status
      );
    }

    return res.json();
  },
};
