import { request } from './client';
import type {
  AdminUserListItem,
  GrantEconomyRequest,
  Broadcast,
  SetBroadcastRequest,
  SurgeStatus,
  AdminFeedbackItem,
  MarketItem,
  CreateMarketItemRequest,
  UpdateMarketItemRequest,
} from '../../types/contract';

export async function getAdminUsers(search?: string): Promise<{ users: AdminUserListItem[]; total: number }> {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return request<{ users: AdminUserListItem[]; total: number }>(`/admin/users${query}`);
}

export async function grantUserEconomy(
  userId: string,
  data: GrantEconomyRequest
): Promise<{ success: boolean; message: string; user: AdminUserListItem }> {
  return request<{ success: boolean; message: string; user: AdminUserListItem }>(
    `/admin/users/${userId}/grant`,
    {
      method: 'POST',
      data,
    }
  );
}

export async function getAdminBroadcast(): Promise<{ broadcast: Broadcast | null }> {
  return request<{ broadcast: Broadcast | null }>('/admin/broadcast');
}

export async function setAdminBroadcast(data: SetBroadcastRequest): Promise<{ broadcast: Broadcast }> {
  return request<{ broadcast: Broadcast }>('/admin/broadcast', {
    method: 'POST',
    data,
  });
}

export async function dismissAdminBroadcast(): Promise<{ success: boolean }> {
  return request<{ success: boolean }>('/admin/broadcast', {
    method: 'DELETE',
  });
}

export async function getAdminSurgeStatus(): Promise<{ surge: SurgeStatus }> {
  return request<{ surge: SurgeStatus }>('/admin/surge');
}

export async function startSurgeEvent(hours: number): Promise<{ success: boolean; surge: SurgeStatus }> {
  return request<{ success: boolean; surge: SurgeStatus }>('/admin/surge/start', {
    method: 'POST',
    data: { hours },
  });
}

export async function endSurgeEvent(): Promise<{ success: boolean }> {
  return request<{ success: boolean }>('/admin/surge/end', {
    method: 'POST',
  });
}

export async function getAdminFeedback(): Promise<{ feedback: AdminFeedbackItem[]; feedbacks: AdminFeedbackItem[] }> {
  const res = await request<{ feedback?: AdminFeedbackItem[]; feedbacks?: AdminFeedbackItem[] }>('/admin/feedback');
  const items = res.feedbacks || res.feedback || [];
  return { feedback: items, feedbacks: items };
}

export async function replyAdminFeedback(
  id: string,
  reply: string,
  status: string = 'REVIEWED'
): Promise<{ success: boolean; feedback: AdminFeedbackItem }> {
  return request<{ success: boolean; feedback: AdminFeedbackItem }>(`/admin/feedback/${id}/reply`, {
    method: 'PATCH',
    data: { reply, replyText: reply, status: status || 'REVIEWED' },
  });
}

export async function deleteAdminFeedback(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/admin/feedback/${id}`, {
    method: 'DELETE',
  });
}

export async function getMarketItems(): Promise<{ items: MarketItem[] }> {
  return request<{ items: MarketItem[] }>('/admin/market/items');
}

export async function createMarketItem(data: CreateMarketItemRequest): Promise<{ item: MarketItem }> {
  return request<{ item: MarketItem }>('/admin/market/items', {
    method: 'POST',
    data,
  });
}

export async function updateMarketItem(
  id: string,
  data: UpdateMarketItemRequest
): Promise<{ item: MarketItem }> {
  return request<{ item: MarketItem }>(`/admin/market/items/${id}`, {
    method: 'PATCH',
    data,
  });
}

export async function deleteMarketItem(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/admin/market/items/${id}`, {
    method: 'DELETE',
  });
}
