/**
 * CONTRACT_FRONTEND_BACKEND.md Shared Types
 * 
 * Strict type definitions matching the authoritative backend contract.
 * Frontend MUST NOT invent fields not documented in the shared specification.
 */

export interface User {
  id: string;
  email: string;
  displayName: string;
}

export interface Attribute {
  key: 'intellect' | 'strength' | 'wisdom' | 'charisma' | 'vitality' | string;
  displayName: string;
  value: number;
}

export interface Character {
  level: number;
  totalXp: number;
  gold: number;
  streakCurrent: number;
  streakBest: number;
  attributes?: Attribute[];
}

export interface AuthMeResponse {
  user: User;
  character: Character;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  starterDiscipline?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  error: ApiErrorDetail;
}

export class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;

  constructor(code: string, message: string, status: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
