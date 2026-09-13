import type {
  CreateFeedbackRequest,
  FeedbackResponse,
  FeedbackListResponse,
} from '../../types/contract';
import { request } from './client';

export const feedbackApi = {
  /**
   * Submits user feedback (Bug Report, Feature Request, or General Feedback).
   * Automatically attaches authenticated session token.
   * POST /api/feedback
   */
  async submit(data: CreateFeedbackRequest): Promise<FeedbackResponse> {
    return request<FeedbackResponse>('/feedback', {
      method: 'POST',
      data,
    });
  },

  /**
   * Retrieves the authenticated user's submitted feedback history.
   * GET /api/feedback
   */
  async getMyFeedback(): Promise<FeedbackListResponse> {
    return request<FeedbackListResponse>('/feedback', {
      method: 'GET',
    });
  },
};
