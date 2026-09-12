import { request } from './client';
import type { SendMagicLinkResponse, VerifyMagicLinkResponse } from '../../types/contract';

export async function sendMagicLink(email: string): Promise<SendMagicLinkResponse> {
  return request<SendMagicLinkResponse>('/auth/magic-link/send', {
    method: 'POST',
    data: { email },
  });
}

export async function verifyMagicLink(token: string): Promise<VerifyMagicLinkResponse> {
  return request<VerifyMagicLinkResponse>(`/auth/magic-link/verify?token=${encodeURIComponent(token)}`, {
    method: 'GET',
  });
}
