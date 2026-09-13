import { request } from './client';
import type { LeaderboardResponse } from '../../types/contract';

export type LeaderboardSortBy = 'level' | 'xp' | 'coins';

export async function getLeaderboard(
  sortBy: LeaderboardSortBy = 'level',
  limit: number = 50
): Promise<LeaderboardResponse> {
  return request<LeaderboardResponse>(
    `/leaderboard?sortBy=${sortBy}&limit=${limit}`,
    { method: 'GET' }
  );
}
