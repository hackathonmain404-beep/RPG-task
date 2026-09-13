import type { GenerateAvatarRequest, GenerateAvatarResponse } from '../../types/contract';
import { request } from './client';

export const avatarApi = {
  /**
   * POST /api/avatars/generate
   * Generates a new avatar with Gemini Imagen / procedural Citadel engine,
   * stores it in user inventory and equips it.
   */
  async generateAvatar(data: GenerateAvatarRequest): Promise<GenerateAvatarResponse> {
    return request<GenerateAvatarResponse>('/avatars/generate', {
      method: 'POST',
      data,
    });
  },
};
