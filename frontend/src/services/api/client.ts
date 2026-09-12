import { ApiError, type ApiErrorResponse } from '../../types/contract';
import { supabase } from '../../lib/supabase';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface RequestOptions extends RequestInit {
  data?: unknown;
}

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { data, headers = {}, ...restOptions } = options;

  // Clean trailing/leading slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const cleanBase = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  const url = `${cleanBase}${cleanEndpoint}`;

  const defaultHeaders: Record<string, string> = {
    Accept: 'application/json',
  };

  if (data !== undefined) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  // Attach Supabase access token as Bearer token for backend auth
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session?.access_token) {
      defaultHeaders['Authorization'] = `Bearer ${sessionData.session.access_token}`;
    }
  } catch {
    // No session available, proceed without token
  }

  const fetchOptions: RequestInit = {
    ...restOptions,
    headers: {
      ...defaultHeaders,
      ...(headers as Record<string, string>),
    },
    // Always include cookies for session authentication
    credentials: 'include',
  };

  if (data !== undefined) {
    fetchOptions.body = JSON.stringify(data);
  }

  let response: Response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Network failure';
    throw new ApiError('NETWORK_ERROR', `Unable to connect to Citadel server: ${errorMsg}`, 0);
  }

  // Handle HTTP 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  let jsonResult: unknown;
  try {
    jsonResult = await response.json();
  } catch {
    jsonResult = null;
  }

  if (!response.ok) {
    const errorPayload = jsonResult as ApiErrorResponse | null;
    const code = errorPayload?.error?.code || `HTTP_${response.status}`;
    const message = errorPayload?.error?.message || response.statusText || 'Citadel server error';
    const details = errorPayload?.error?.details;
    throw new ApiError(code, message, response.status, details);
  }

  return jsonResult as T;
}
