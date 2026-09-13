import { request } from './client';
import type { ChatMessage, ChatMessagesResponse } from '../../types/contract';

/**
 * Fetch community chat messages from the last 3 days.
 */
export async function getCommunityChatMessages(
  limit: number = 100
): Promise<ChatMessagesResponse> {
  return request<ChatMessagesResponse>(
    `/chat/messages?limit=${limit}`,
    { method: 'GET' }
  );
}

/**
 * Send a new community chat message.
 */
export async function sendCommunityChatMessage(
  content: string
): Promise<ChatMessage> {
  return request<ChatMessage>(
    '/chat/messages',
    { method: 'POST', data: { content } }
  );
}
