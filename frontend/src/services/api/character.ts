/**
 * Character API Service
 * 
 * Calls the backend GET /api/character endpoint for the full character sheet
 * including server-authoritative attribute values.
 */
import type { Attribute } from '../../types/contract';
import { request } from './client';

export interface CharacterResponse {
  level: number;
  totalXp: number;
  gold: number;
  streakCurrent: number;
  streakBest: number;
  attributes: Attribute[];
}

export interface HistoryItem {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  xpGained?: number;
  goldGained?: number;
  attributeGained?: {
    key: string;
    amount: number;
  };
  levelBefore?: number;
  levelAfter?: number;
  streakCurrent?: number;
}

export const characterApi = {
  /**
   * GET /api/character
   * Returns the full character sheet with attributes from the server.
   */
  async getCharacter(): Promise<CharacterResponse> {
    return request<CharacterResponse>('/character', {
      method: 'GET',
    });
  },

  /**
   * GET /api/character/history
   * Returns progression/activity history from the backend.
   */
  async getHistory(): Promise<HistoryItem[]> {
    const data = await request<HistoryItem[] | { history: HistoryItem[] }>('/character/history', {
      method: 'GET',
    });
    return Array.isArray(data) ? data : (data.history || []);
  },
};

