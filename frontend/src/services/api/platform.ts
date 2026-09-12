import { request } from './client';
import type { Broadcast, SurgeStatus } from '../../types/contract';

export async function getActivePlatformBroadcast(): Promise<{ broadcast: Broadcast | null }> {
  return request<{ broadcast: Broadcast | null }>('/platform/broadcast/active');
}

export async function getPlatformSurgeStatus(): Promise<{ surge: SurgeStatus }> {
  return request<{ surge: SurgeStatus }>('/platform/surge/status');
}
